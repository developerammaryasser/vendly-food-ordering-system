import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity({ name: 'orderItems' })
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  order: Order;
  @ManyToOne(() => Product)
  product: Product;
  @Column()
  name: string;
  @Column()
  quantity: number;
  @Column()
  price: number;
}
