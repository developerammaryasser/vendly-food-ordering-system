import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderItem } from './orderItem.entity';
export class Customer {
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  phone: string;
  @Column()
  address: string;
  @Column()
  city: string;
  @Column()
  state: string;
  @Column()
  zip: string;
  @Column()
  notes: string;
}
@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;
  @Column(() => Customer)
  customer: Customer;
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  orderItems: OrderItem[];
  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;
  @Column({
    default: 'pending',
    type: 'enum',
    enum: ['pending', 'completed', 'cancelled'],
  })
  status: string;
}
