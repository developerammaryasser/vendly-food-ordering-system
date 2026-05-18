import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  async create(createOrderDto: CreateOrderDto) {
    const { customer, orderItems } = createOrderDto;
    // Map over the orderItems and create new order items
    const newOrderItems = await Promise.all(
      orderItems.map(async (item: any) => {
        const product = await this.productRepository.findOne({
          where: { id: item.product },
        });
        return {
          product: product,
          name: item.name,
          quantity: item.quantity,
          price: product?.price || item.price,
        } as any;
      }),
    );
    // Calculate total price
    const totalPrice = newOrderItems.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);
    const order = this.orderRepository.create({
      customer,
      orderItems: newOrderItems,
      totalPrice,
    });
    return this.orderRepository.save(order);
  }

  async findAll() {
    return await this.orderRepository.find({ relations: ['orderItems'] });
  }

  async findUserOrders(email: string) {
    const allOrders = await this.findAll();
    return allOrders.filter(order => order.customer?.email === email);
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  // async update(id: number, updateOrderDto: UpdateOrderDto) {
  //   const order = await this.findOne(id);
  //   const { customer, orderItems } = updateOrderDto;
  //   // Map over the orderItems and create new order items
  //   const newOrderItems = await Promise.all(
  //     orderItems.map(async (item: any) => {
  //       const product = await this.productRepository.findOne({
  //         where: { id: item.product },
  //       });
  //       return {
  //         product: product,
  //         name: item.name,
  //         quantity: item.quantity,
  //         price: product?.price || item.price,
  //       } as any;
  //     }),
  //   );
  //   // Calculate total price
  //   const totalPrice = newOrderItems.reduce((acc, item) => {
  //     return acc + item.price * item.quantity;
  //   }, 0);
  //   order.customer = customer ?? order.customer;
  //   order.orderItems = newOrderItems ?? order.orderItems;
  //   order.totalPrice = totalPrice ?? order.totalPrice;
  //   return this.orderRepository.save(order);
  // }

  async updateStatus(id: number, status: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.product'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const oldStatus = order.status;

    if (oldStatus !== status) {
      // If transitioning to completed status, decrease product stock
      if (status === 'completed') {
        for (const item of order.orderItems) {
          if (item.product) {
            const newStock = item.product.stock - item.quantity;
            item.product.stock = newStock < 0 ? 0 : newStock;
            await this.productRepository.save(item.product);
          }
        }
      }
      // If transitioning from completed status to another status, restore product stock
      else if (oldStatus === 'completed') {
        for (const item of order.orderItems) {
          if (item.product) {
            item.product.stock += item.quantity;
            await this.productRepository.save(item.product);
          }
        }
      }
    }

    order.status = status;
    return this.orderRepository.save(order);
  }

  async remove(id: number) {
    const order = await this.findOne(id);
    return this.orderRepository.remove(order);
  }
}
