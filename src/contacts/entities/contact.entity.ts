import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'contact'})
export class Contact {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ nullable: true })
    phoneNumber: string;
  
    @Column({ nullable: true })
    email: string;
  
    @ManyToOne(() => Contact, { nullable: true })
    @JoinColumn({ name: "linkedId" })
    linkedContact: Contact;
  
    @Column()
    linkPrecedence: "primary" | "secondary";
  
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;
  
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt: Date;
  
    @Column({ type: "timestamp", nullable: true })
    deletedAt: Date;
}
