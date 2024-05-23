import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>
    ){};


  async findAll() {
    return await this.contactRepository.find();
  }

  async findOneById(id: number) {
    return await this.contactRepository.find({
      where: {id}
    });
  }

  async remove(id: number) {
    const contact = await this.findOneById(id);

    if (!contact) {
      throw new NotFoundException();
    }
    return await this.contactRepository.remove(contact);
  }
}
