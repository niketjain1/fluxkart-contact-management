import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create({ email, linkedId, linkPrecedence, phoneNumber }) {
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
      where: { linkedId: id }
    })
  }

  async findOneByEmail(email: string) {
    return await this.contactRepository.find({
      where: { email }
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

  async identify(email?: string, phoneNumber?: string) {
    let primaryContact: Contact;
    let contacts: Contact[] = [];

    if (email) {
      contacts = await this.contactRepository.find({ where: { email } });
    }
    if (!contacts.length && phoneNumber) {
      contacts = await this.contactRepository.find({ where: { phoneNumber } });
    }

    if (contacts[0].linkPrecedence === 'secondary') {
      primaryContact = await this.findOneById(contacts[0].linkedId);
    } else {
      primaryContact = contacts[0];
    }

    if (!primaryContact) {
      const newContact = this.contactRepository.create({
        email,
        phoneNumber,
        linkPrecedence: 'primary',
      });
      await this.contactRepository.save(newContact);
      return this.formatResponse(newContact, []);
    }


    const secondaryContacts = await this.findByLinkedId(primaryContact.id)

    const isNewSecondaryContact =
      email &&
      phoneNumber &&
      secondaryContacts.some(
        (contact) =>
          contact.email === email && contact.phoneNumber === phoneNumber,
      );

    if (isNewSecondaryContact) {
      const newSecondaryContact = this.contactRepository.create({
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
      });
      await this.contactRepository.save(newSecondaryContact);
      secondaryContacts.push(newSecondaryContact);
    }

    return this.formatResponse(primaryContact, secondaryContacts);
  }

  private formatResponse(primary: Contact, secondaries: Contact[]) {
    const phoneNumbersSet = new Set<string>([primary.phoneNumber]);
    secondaries.forEach((secondary) => {
      if (secondary.phoneNumber) {
        phoneNumbersSet.add(secondary.phoneNumber);
      }
    });

    return {
      contact: {
        primaryContactId: primary.id,
        emails: [
          primary.email,
          ...secondaries.map((s) => s.email).filter(Boolean),
        ],
        phoneNumbers: Array.from(phoneNumbersSet),
        secondaryContactIds: secondaries.map((s) => s.id),
      },
    };
  }
}
