import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Contact } from './entities/contact.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async create(email, phoneNumber, linkedId, linkPrecedence) {
    const requestBody = {
      email,
      linkedId,
      linkPrecedence,
      phoneNumber,
    };
    const contact = this.contactRepository.create(requestBody);
  }

  async findAll() {
    return await this.contactRepository.find();
  }

  async findById(id: number) {
    return await this.contactRepository.find({
      where: { id },
    });
  }

  async findOneById(id: number) {
    return await this.contactRepository.findOne({
      where: { id },
    });
  }

  async findByLinkedId(id: number) {
    return await this.contactRepository.find({
      where: { linkedId: id },
    });
  }

  async findOneByEmail(email: string) {
    return await this.contactRepository.find({
      where: { email },
    });
  }

  async remove(id: number) {
    const contact = await this.findById(id);

    if (!contact) {
      throw new NotFoundException();
    }
    return await this.contactRepository.remove(contact);
  }

  async resetContactSequence() {
    await this.entityManager.query('DELETE FROM contact');
    await this.entityManager.query(
      'ALTER SEQUENCE contact_id_seq RESTART WITH 1',
    );
  }

  // function to fetch all the contacts for the given email and phoneNumber
  private async getContacts(
    email?: string,
    phoneNumber?: string,
  ): Promise<Contact[]> {
    if (email || phoneNumber) {
      return await this.contactRepository.find({
        where: [{ email }, { phoneNumber }],
      });
    }
    return [];
  }

  // function to create primary contact
  private async createPrimaryContact(email?: string, phoneNumber?: string) {
    const newContact = this.contactRepository.create({
      email,
      phoneNumber,
      linkPrecedence: 'primary',
    });
    await this.contactRepository.save(newContact);
    return {
      contact: {
        primaryContactId: newContact.id,
        emails: [newContact.email],
        phoneNumbers: [newContact.phoneNumber],
        secondaryContactIds: [],
      },
    };
  }

  private async handleNewSecondaryContact(
    email: string | undefined,
    phoneNumber: string | undefined,
    primaryContact: Contact,
    emails: Set<string>,
    phoneNumbers: Set<string>,
    secondaryContactIds: number[],
  ) {
    // check if it is a new secondary contact
    const isNewSecondaryContact =
      (email && !emails.has(email)) ||
      (phoneNumber && !phoneNumbers.has(phoneNumber));

    if (isNewSecondaryContact) {
      const newSecondaryContact = this.contactRepository.create({
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
      });
      await this.contactRepository.save(newSecondaryContact);
      secondaryContactIds.push(newSecondaryContact.id);

      // add email and phoneNumber to the emails set and phoneNumbers set
      if (email) emails.add(email);
      if (phoneNumber) phoneNumbers.add(phoneNumber);
    }
  }

  // Function to find all the potential primary contacts
  private async getPotentialPrimaryContacts(
    contacts: Contact[],
  ): Promise<Contact[]> {
    // Find all potential primary contacts, this is for the case when the request has multiple primary contacts
    let primaryContacts = contacts.filter(
      (contact) => contact.linkPrecedence === 'primary',
    );

    // Checking if the request email is of type secondary email, if so we will find the potential primary contact
    if (contacts.length > 0 && contacts[0].linkPrecedence === 'secondary') {
      primaryContacts = await this.contactRepository.find({
        where: { id: contacts[0].linkedId },
      });
    }

    return primaryContacts;
  }

  // function to reduce the primary contacts such that it returns the oldest primary contact
  private getOldestPrimaryContact(primaryContacts: Contact[]): Contact {
    return primaryContacts.reduce((oldest, contact) => {
      return oldest.createdAt < contact.createdAt ? oldest : contact;
    });
  }

  private async linkSecondaryContacts(
    primaryContacts: Contact[],
    primaryContact: Contact,
  ) {
    for (const contact of primaryContacts) {
      if (contact.id !== primaryContact.id) {
        contact.linkPrecedence = 'secondary';
        contact.linkedId = primaryContact.id;
        await this.contactRepository.save(contact);
      }
    }
  }

  private extractContactInfo(
    allLinkedContacts: Contact[],
    primaryContact: Contact,
  ) {
    const emails = new Set<string>();
    const phoneNumbers = new Set<string>();
    const secondaryContactIds: number[] = [];

    for (const contact of allLinkedContacts) {
      if (contact.email) emails.add(contact.email);
      if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
      if (contact.id !== primaryContact.id) {
        secondaryContactIds.push(contact.id);
      }
    }

    return { emails, phoneNumbers, secondaryContactIds };
  }

  private formatResponse(
    primaryContact: Contact,
    secondaryContactIds: number[],
    emails: Set<string>,
    phoneNumbers: Set<string>,
  ) {
    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails: Array.from(emails),
        phoneNumbers: Array.from(phoneNumbers),
        secondaryContactIds,
      },
    };
  }
  
  async identify(email?: string, phoneNumber?: string) {
    try {
      // Fetching all the contacts
      let contacts: Contact[] = await this.getContacts(email, phoneNumber);
  
      // if no contact found create a new primary contact
      if (email != null && phoneNumber != null && contacts.length === 0) {
        return await this.createPrimaryContact(email, phoneNumber);
      }
  
      // Get all primary contacts directly associated with the given email or phoneNumber
      let primaryContacts = await this.getPotentialPrimaryContacts(contacts);
  
      // Collect all related contacts, including secondary ones linked to these primary contacts
      let allRelatedContacts = new Set<Contact>(contacts);
  
      for (const primaryContact of primaryContacts) {
        const relatedContacts = await this.contactRepository.find({
          where: [
            { id: primaryContact.id },
            { linkedId: primaryContact.id }
          ],
        });
        relatedContacts.forEach(contact => allRelatedContacts.add(contact));
      }
  
      // Ensure all related contacts are linked to the oldest primary contact
      const primaryContactsArray = Array.from(primaryContacts);
      const oldestPrimaryContact = this.getOldestPrimaryContact(primaryContactsArray);
  
      await this.linkSecondaryContacts(primaryContactsArray, oldestPrimaryContact);
  
      // Update all related contacts to point to the oldest primary contact
      for (const contact of allRelatedContacts) {
        if (contact.linkPrecedence === 'primary' && contact.id !== oldestPrimaryContact.id) {
          contact.linkPrecedence = 'secondary';
          contact.linkedId = oldestPrimaryContact.id;
          await this.contactRepository.save(contact);
        }
      }
  
      // Get all final linked contacts, including primary and secondary
      const finalLinkedContacts = await this.contactRepository.find({
        where: [
          { id: oldestPrimaryContact.id },
          { linkedId: oldestPrimaryContact.id }
        ],
      });
  
      // Extract emails, phone numbers, and secondary contact IDs
      const { emails, phoneNumbers, secondaryContactIds } =
        this.extractContactInfo(finalLinkedContacts, oldestPrimaryContact);
  
      // Check if we need to create a new secondary contact
      await this.handleNewSecondaryContact(
        email,
        phoneNumber,
        oldestPrimaryContact,
        emails,
        phoneNumbers,
        secondaryContactIds,
      );
  
      return this.formatResponse(
        oldestPrimaryContact,
        secondaryContactIds,
        emails,
        phoneNumbers,
      );
    } catch (error) {
      console.error('Error Identifying contact: ', error);
      throw new Error('An error occurred identifying the contact');
    }
  }
}
