import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService, PaymentRequest } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createPayment(
    @Headers('authorization') authHeader: string,
    @Body() paymentData: PaymentRequest,
  ) {
    this.paymentsService.validateApiKey(authHeader);
    return this.paymentsService.processPayment(paymentData);
  }

  @Get(':transaction_id')
  async getPayment(
    @Headers('authorization') authHeader: string,
    @Param('transaction_id') id: string,
  ) {
    this.paymentsService.validateApiKey(authHeader);
    return this.paymentsService.getTransaction(id);
  }

  @Post('escrow/hold')
  @HttpCode(HttpStatus.OK)
  async holdPayment(
    @Headers('authorization') authHeader: string,
    @Body() body: { contratacion_id: string; transaction_id: string },
  ) {
    this.paymentsService.validateApiKey(authHeader);
    return this.paymentsService.holdPayment(body.contratacion_id, body.transaction_id);
  }

  @Post('escrow/release')
  @HttpCode(HttpStatus.OK)
  async releasePayment(
    @Headers('authorization') authHeader: string,
    @Body() body: { contratacion_id: string },
  ) {
    this.paymentsService.validateApiKey(authHeader);
    return this.paymentsService.releasePayment(body.contratacion_id);
  }

  @Post('escrow/refund')
  @HttpCode(HttpStatus.OK)
  async refundPayment(
    @Headers('authorization') authHeader: string,
    @Body() body: { contratacion_id: string },
  ) {
    this.paymentsService.validateApiKey(authHeader);
    return this.paymentsService.refundPayment(body.contratacion_id);
  }

  @Get('escrow/:contratacion_id')
  async getEscrowByContratacion(
    @Headers('authorization') authHeader: string,
    @Param('contratacion_id') contratacionId: string,
  ) {
    this.paymentsService.validateApiKey(authHeader);
    return this.paymentsService.findByContratacion(contratacionId);
  }
}
