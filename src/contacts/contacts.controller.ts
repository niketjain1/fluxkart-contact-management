import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContactsService } from './contacts.service';


@Controller()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post('create/contact')
  create(@Body() body: {email: string; phoneNumber: string; linkedId?: number; linkPrecedence: 'primary' | 'secondary'}) {
    return this.contactsService.create(body.email, body.phoneNumber, body.linkedId, body.linkPrecedence);
  }

  @Post('identify')
  async identify(@Body() body: { email?: string; phoneNumber?: string }) {
    return await this.contactsService.identify(body.email, body.phoneNumber);
  }

  @Get('find_contacts')
  findAll() {
    return this.contactsService.findAll();
  }

  @Post('reset-sequence')
  async resetSequence() {
    await this.contactsService.resetContactSequence();
    return { message: 'Sequence reset successfully' };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactsService.remove(+id);
  }
}
