import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { Response } from 'express';

@Controller()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post('create/contact')
  create(
    @Body()
    body: {
      email: string;
      phoneNumber: string;
      linkedId?: number;
      linkPrecedence: 'primary' | 'secondary';
    },
  ) {
    return this.contactsService.create(
      body.email,
      body.phoneNumber,
      body.linkedId,
      body.linkPrecedence,
    );
  }

  @Post('identify')
  async identify(
    @Body() body: { email?: string; phoneNumber?: string },
    @Res() res: Response,
  ) {
    try {
      const result = await this.contactsService.identify(
        body.email,
        body.phoneNumber,
      );
      return res.status(200).json(result);
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            'An error occurred identifying or creating the contact, please check if the request is not null',
        });
    }
  }

  @Get('contacts')
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
