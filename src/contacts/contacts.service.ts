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

  async findOneById(id: number) {
    return await this.contactRepository.find({
      where: { id },
    });
  }

  async remove(id: number) {
    const contact = await this.findOneById(id);

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
}
