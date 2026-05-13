import { Customer } from '../entities/order.entity';
import { Product } from 'src/products/entities/product.entity';

export class CreateOrderDto {
  customer: Customer;
  orderItems: {
    product: Product;
    name: string;
    quantity: number;
  }[];
}
