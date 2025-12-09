/**
 * Configuración de InversifyJS container
 * Todos los bindings para Dependency Injection
 */

import 'reflect-metadata';
import { Container } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { TYPES } from './types';

// ============================================
// REPOSITORIES - Shared
// ============================================
import { ITenantRepository } from '../domains/shared/tenants/domain/repositories/ITenantRepository';
import { PrismaTenantRepository } from '../domains/shared/tenants/infrastructure/repositories/PrismaTenantRepository';
import { IUserRepository } from '../domains/shared/users/domain/repositories/IUserRepository';
import { PrismaUserRepository } from '../domains/shared/users/infrastructure/repositories/PrismaUserRepository';
import { IBranchRepository } from '../domains/shared/branches/domain/repositories/IBranchRepository';
import { PrismaBranchRepository } from '../domains/shared/branches/infrastructure/repositories/PrismaBranchRepository';
import { IOrderCounterRepository } from '../domains/shared/order-counters/domain/repositories/IOrderCounterRepository';
import { PrismaOrderCounterRepository } from '../domains/shared/order-counters/infrastructure/repositories/PrismaOrderCounterRepository';
import { ISubscriptionPlanRepository } from '../domains/shared/subscription-plans/domain/repositories/ISubscriptionPlanRepository';
import { PrismaSubscriptionPlanRepository } from '../domains/shared/subscription-plans/infrastructure/repositories/PrismaSubscriptionPlanRepository';
import { IOAuthClientRepository } from '../domains/shared/oauth/domain/repositories/IOAuthClientRepository';
import { PrismaOAuthClientRepository } from '../domains/shared/oauth/infrastructure/repositories/PrismaOAuthClientRepository';
import { IOAuthAuthorizationCodeRepository } from '../domains/shared/oauth/domain/repositories/IOAuthAuthorizationCodeRepository';
import { PrismaOAuthAuthorizationCodeRepository } from '../domains/shared/oauth/infrastructure/repositories/PrismaOAuthAuthorizationCodeRepository';
import { IOAuthTokenRepository } from '../domains/shared/oauth/domain/repositories/IOAuthTokenRepository';
import { PrismaOAuthTokenRepository } from '../domains/shared/oauth/infrastructure/repositories/PrismaOAuthTokenRepository';

// ============================================
// REPOSITORIES - Delivery
// ============================================
import { IOrderRepository } from '../domains/delivery/orders/domain/repositories/IOrderRepository';
import { PrismaOrderRepository } from '../domains/delivery/orders/infrastructure/repositories/PrismaOrderRepository';
import { IDriverRepository } from '../domains/delivery/drivers/domain/repositories/IDriverRepository';
import { PrismaDriverRepository } from '../domains/delivery/drivers/infrastructure/repositories/PrismaDriverRepository';
import { IVehicleRepository } from '../domains/delivery/vehicles/domain/repositories/IVehicleRepository';
import { PrismaVehicleRepository } from '../domains/delivery/vehicles/infrastructure/repositories/PrismaVehicleRepository';
import { ILogisticsProviderRepository } from '../domains/delivery/logistics-providers/domain/repositories/ILogisticsProviderRepository';
import { PrismaLogisticsProviderRepository } from '../domains/delivery/logistics-providers/infrastructure/repositories/PrismaLogisticsProviderRepository';
import { IDeliveryZoneRepository } from '../domains/delivery/delivery-zones/domain/repositories/IDeliveryZoneRepository';
import { PrismaDeliveryZoneRepository } from '../domains/delivery/delivery-zones/infrastructure/repositories/PrismaDeliveryZoneRepository';
import { IDeliveryRateRepository } from '../domains/delivery/delivery-rates/domain/repositories/IDeliveryRateRepository';
import { PrismaDeliveryRateRepository } from '../domains/delivery/delivery-rates/infrastructure/repositories/PrismaDeliveryRateRepository';
import { IOrderPaymentTransactionRepository } from '../domains/delivery/order-payments/domain/repositories/IOrderPaymentTransactionRepository';
import { PrismaOrderPaymentTransactionRepository } from '../domains/delivery/order-payments/infrastructure/repositories/PrismaOrderPaymentTransactionRepository';

// ============================================
// REPOSITORIES - Retail
// ============================================
import { ICategoryRepository } from '../domains/retail/categories/domain/repositories/ICategoryRepository';
import { PrismaCategoryRepository } from '../domains/retail/categories/infrastructure/repositories/PrismaCategoryRepository';
import { IBrandRepository } from '../domains/retail/brands/domain/repositories/IBrandRepository';
import { PrismaBrandRepository } from '../domains/retail/brands/infrastructure/repositories/PrismaBrandRepository';
import { IProductRepository } from '../domains/retail/products/domain/repositories/IProductRepository';
import { PrismaProductRepository } from '../domains/retail/products/infrastructure/repositories/PrismaProductRepository';
import { IProductVariantRepository } from '../domains/retail/product-variants/domain/repositories/IProductVariantRepository';
import { PrismaProductVariantRepository } from '../domains/retail/product-variants/infrastructure/repositories/PrismaProductVariantRepository';
import { IStockByBranchRepository } from '../domains/retail/inventory/domain/repositories/IStockByBranchRepository';
import { PrismaStockByBranchRepository } from '../domains/retail/inventory/infrastructure/repositories/PrismaStockByBranchRepository';
import { IInventoryMovementRepository } from '../domains/retail/inventory/domain/repositories/IInventoryMovementRepository';
import { PrismaInventoryMovementRepository } from '../domains/retail/inventory/infrastructure/repositories/PrismaInventoryMovementRepository';

// ============================================
// REPOSITORIES - Payments
// ============================================
import { IPaymentTransactionRepository } from '../domains/shared/payments/domain/repositories/IPaymentTransactionRepository';
import { PrismaPaymentTransactionRepository } from '../domains/shared/payments/infrastructure/repositories/PrismaPaymentTransactionRepository';

// ============================================
// SERVICES - Shared
// ============================================
import { AuthService } from '../domains/shared/auth/application/services/AuthService';
import { OrderNumberService } from '../domains/shared/order-counters/application/services/OrderNumberService';
import { OAuthAuthorizationService } from '../domains/shared/oauth/application/services/OAuthAuthorizationService';
import { OAuthTokenService } from '../domains/shared/oauth/application/services/OAuthTokenService';
import { SubscriptionLimitService } from '../domains/shared/subscription-plans/application/services/SubscriptionLimitService';
import { BillingService } from '../domains/shared/subscription-plans/application/services/BillingService';

// ============================================
// SERVICES - Delivery
// ============================================
import { DeliveryCostCalculator } from '../domains/delivery/delivery-cost/application/services/DeliveryCostCalculator';

// ============================================
// SERVICES - Retail
// ============================================
import { StockCalculator } from '../domains/retail/inventory/application/services/StockCalculator';
import { StockReservationService } from '../domains/retail/inventory/application/services/StockReservationService';

// ============================================
// SERVICES - Payments
// ============================================
import { StripeService } from '../domains/shared/payments/application/services/StripeService';

// ============================================
// SERVICES - Shared Utilities
// ============================================
import { CurrencyService } from '../domains/shared/currency/CurrencyService';
import { i18nService } from '../domains/shared/i18n/I18nService';

// ============================================
// USE CASES - Shared - Tenants
// ============================================
import { CreateTenantUseCase } from '../domains/shared/tenants/application/use-cases/CreateTenantUseCase';
import { GetTenantUseCase } from '../domains/shared/tenants/application/use-cases/GetTenantUseCase';
import { ListTenantsUseCase } from '../domains/shared/tenants/application/use-cases/ListTenantsUseCase';
import { UpdateTenantUseCase } from '../domains/shared/tenants/application/use-cases/UpdateTenantUseCase';
import { DeleteTenantUseCase } from '../domains/shared/tenants/application/use-cases/DeleteTenantUseCase';

// ============================================
// USE CASES - Shared - Users
// ============================================
import { CreateUserUseCase } from '../domains/shared/users/application/use-cases/CreateUserUseCase';
import { GetUserUseCase } from '../domains/shared/users/application/use-cases/GetUserUseCase';
import { ListUsersUseCase } from '../domains/shared/users/application/use-cases/ListUsersUseCase';
import { UpdateUserUseCase } from '../domains/shared/users/application/use-cases/UpdateUserUseCase';
import { DeleteUserUseCase } from '../domains/shared/users/application/use-cases/DeleteUserUseCase';

// ============================================
// USE CASES - Shared - Branches
// ============================================
import { CreateBranchUseCase } from '../domains/shared/branches/application/use-cases/CreateBranchUseCase';
import { GetBranchUseCase } from '../domains/shared/branches/application/use-cases/GetBranchUseCase';
import { ListBranchesUseCase } from '../domains/shared/branches/application/use-cases/ListBranchesUseCase';
import { UpdateBranchUseCase } from '../domains/shared/branches/application/use-cases/UpdateBranchUseCase';
import { DeleteBranchUseCase } from '../domains/shared/branches/application/use-cases/DeleteBranchUseCase';

// ============================================
// USE CASES - Shared - Order Counters
// ============================================
import { CreateOrderCounterUseCase } from '../domains/shared/order-counters/application/use-cases/CreateOrderCounterUseCase';
import { GetOrderCounterUseCase } from '../domains/shared/order-counters/application/use-cases/GetOrderCounterUseCase';
import { UpdateOrderCounterUseCase } from '../domains/shared/order-counters/application/use-cases/UpdateOrderCounterUseCase';
import { IncrementOrderCounterUseCase } from '../domains/shared/order-counters/application/use-cases/IncrementOrderCounterUseCase';

// ============================================
// USE CASES - Shared - Subscription Plans
// ============================================
import { CreateSubscriptionPlanUseCase } from '../domains/shared/subscription-plans/application/use-cases/CreateSubscriptionPlanUseCase';
import { GetSubscriptionPlanUseCase } from '../domains/shared/subscription-plans/application/use-cases/GetSubscriptionPlanUseCase';
import { ListSubscriptionPlansUseCase } from '../domains/shared/subscription-plans/application/use-cases/ListSubscriptionPlansUseCase';
import { UpdateSubscriptionPlanUseCase } from '../domains/shared/subscription-plans/application/use-cases/UpdateSubscriptionPlanUseCase';
import { DeleteSubscriptionPlanUseCase } from '../domains/shared/subscription-plans/application/use-cases/DeleteSubscriptionPlanUseCase';
import { ChangeTenantPlanUseCase } from '../domains/shared/subscription-plans/application/use-cases/ChangeTenantPlanUseCase';
import { StartTrialUseCase } from '../domains/shared/subscription-plans/application/use-cases/StartTrialUseCase';
import { ConvertTrialToPaidUseCase } from '../domains/shared/subscription-plans/application/use-cases/ConvertTrialToPaidUseCase';

// ============================================
// USE CASES - Delivery - Logistics Providers
// ============================================
import { CreateLogisticsProviderUseCase } from '../domains/delivery/logistics-providers/application/use-cases/CreateLogisticsProviderUseCase';
import { GetLogisticsProviderUseCase } from '../domains/delivery/logistics-providers/application/use-cases/GetLogisticsProviderUseCase';
import { ListLogisticsProvidersUseCase } from '../domains/delivery/logistics-providers/application/use-cases/ListLogisticsProvidersUseCase';
import { UpdateLogisticsProviderUseCase } from '../domains/delivery/logistics-providers/application/use-cases/UpdateLogisticsProviderUseCase';
import { DeleteLogisticsProviderUseCase } from '../domains/delivery/logistics-providers/application/use-cases/DeleteLogisticsProviderUseCase';

// ============================================
// USE CASES - Delivery - Drivers
// ============================================
import { CreateDriverUseCase } from '../domains/delivery/drivers/application/use-cases/CreateDriverUseCase';
import { GetDriverUseCase } from '../domains/delivery/drivers/application/use-cases/GetDriverUseCase';
import { ListDriversUseCase } from '../domains/delivery/drivers/application/use-cases/ListDriversUseCase';
import { UpdateDriverUseCase } from '../domains/delivery/drivers/application/use-cases/UpdateDriverUseCase';
import { DeleteDriverUseCase } from '../domains/delivery/drivers/application/use-cases/DeleteDriverUseCase';

// ============================================
// USE CASES - Delivery - Vehicles
// ============================================
import { CreateVehicleUseCase } from '../domains/delivery/vehicles/application/use-cases/CreateVehicleUseCase';
import { GetVehicleUseCase } from '../domains/delivery/vehicles/application/use-cases/GetVehicleUseCase';
import { ListVehiclesUseCase } from '../domains/delivery/vehicles/application/use-cases/ListVehiclesUseCase';
import { UpdateVehicleUseCase } from '../domains/delivery/vehicles/application/use-cases/UpdateVehicleUseCase';
import { DeleteVehicleUseCase } from '../domains/delivery/vehicles/application/use-cases/DeleteVehicleUseCase';

// ============================================
// USE CASES - Delivery - Delivery Zones
// ============================================
import { CreateDeliveryZoneUseCase } from '../domains/delivery/delivery-zones/application/use-cases/CreateDeliveryZoneUseCase';
import { GetDeliveryZoneUseCase } from '../domains/delivery/delivery-zones/application/use-cases/GetDeliveryZoneUseCase';
import { ListDeliveryZonesUseCase } from '../domains/delivery/delivery-zones/application/use-cases/ListDeliveryZonesUseCase';
import { UpdateDeliveryZoneUseCase } from '../domains/delivery/delivery-zones/application/use-cases/UpdateDeliveryZoneUseCase';
import { DeleteDeliveryZoneUseCase } from '../domains/delivery/delivery-zones/application/use-cases/DeleteDeliveryZoneUseCase';

// ============================================
// USE CASES - Delivery - Delivery Rates
// ============================================
import { CreateDeliveryRateUseCase } from '../domains/delivery/delivery-rates/application/use-cases/CreateDeliveryRateUseCase';
import { GetDeliveryRateUseCase } from '../domains/delivery/delivery-rates/application/use-cases/GetDeliveryRateUseCase';
import { ListDeliveryRatesUseCase } from '../domains/delivery/delivery-rates/application/use-cases/ListDeliveryRatesUseCase';
import { UpdateDeliveryRateUseCase } from '../domains/delivery/delivery-rates/application/use-cases/UpdateDeliveryRateUseCase';
import { DeleteDeliveryRateUseCase } from '../domains/delivery/delivery-rates/application/use-cases/DeleteDeliveryRateUseCase';

// ============================================
// USE CASES - Retail - Categories
// ============================================
import { CreateCategoryUseCase } from '../domains/retail/categories/application/use-cases/CreateCategoryUseCase';
import { GetCategoryUseCase } from '../domains/retail/categories/application/use-cases/GetCategoryUseCase';
import { ListCategoriesUseCase } from '../domains/retail/categories/application/use-cases/ListCategoriesUseCase';
import { UpdateCategoryUseCase } from '../domains/retail/categories/application/use-cases/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '../domains/retail/categories/application/use-cases/DeleteCategoryUseCase';

// ============================================
// USE CASES - Retail - Brands
// ============================================
import { CreateBrandUseCase } from '../domains/retail/brands/application/use-cases/CreateBrandUseCase';
import { GetBrandUseCase } from '../domains/retail/brands/application/use-cases/GetBrandUseCase';
import { ListBrandsUseCase } from '../domains/retail/brands/application/use-cases/ListBrandsUseCase';
import { UpdateBrandUseCase } from '../domains/retail/brands/application/use-cases/UpdateBrandUseCase';
import { DeleteBrandUseCase } from '../domains/retail/brands/application/use-cases/DeleteBrandUseCase';

// ============================================
// USE CASES - Retail - Products
// ============================================
import { CreateProductUseCase } from '../domains/retail/products/application/use-cases/CreateProductUseCase';
import { GetProductUseCase } from '../domains/retail/products/application/use-cases/GetProductUseCase';
import { ListProductsUseCase } from '../domains/retail/products/application/use-cases/ListProductsUseCase';
import { UpdateProductUseCase } from '../domains/retail/products/application/use-cases/UpdateProductUseCase';
import { DeleteProductUseCase } from '../domains/retail/products/application/use-cases/DeleteProductUseCase';

// ============================================
// USE CASES - Retail - Product Variants
// ============================================
import { CreateProductVariantUseCase } from '../domains/retail/product-variants/application/use-cases/CreateProductVariantUseCase';
import { GetProductVariantUseCase } from '../domains/retail/product-variants/application/use-cases/GetProductVariantUseCase';
import { ListProductVariantsUseCase } from '../domains/retail/product-variants/application/use-cases/ListProductVariantsUseCase';
import { UpdateProductVariantUseCase } from '../domains/retail/product-variants/application/use-cases/UpdateProductVariantUseCase';
import { DeleteProductVariantUseCase } from '../domains/retail/product-variants/application/use-cases/DeleteProductVariantUseCase';

// ============================================
// USE CASES - Shared - OAuth
// ============================================
import { CreateOAuthClientUseCase } from '../domains/shared/oauth/application/use-cases/CreateOAuthClientUseCase';
import { GetOAuthClientUseCase } from '../domains/shared/oauth/application/use-cases/GetOAuthClientUseCase';
import { ListOAuthClientsUseCase } from '../domains/shared/oauth/application/use-cases/ListOAuthClientsUseCase';
import { UpdateOAuthClientUseCase } from '../domains/shared/oauth/application/use-cases/UpdateOAuthClientUseCase';
import { DeleteOAuthClientUseCase } from '../domains/shared/oauth/application/use-cases/DeleteOAuthClientUseCase';

// ============================================
// USE CASES - Shared - Payments
// ============================================
import { CreatePaymentTransactionUseCase } from '../domains/shared/payments/application/use-cases/CreatePaymentTransactionUseCase';
import { ListPaymentTransactionsUseCase } from '../domains/shared/payments/application/use-cases/ListPaymentTransactionsUseCase';
import { UpdatePaymentStatusUseCase } from '../domains/shared/payments/application/use-cases/UpdatePaymentStatusUseCase';
import { CreateStripeCheckoutUseCase } from '../domains/shared/payments/application/use-cases/CreateStripeCheckoutUseCase';
import { CreateRefundUseCase } from '../domains/shared/payments/application/use-cases/CreateRefundUseCase';
import { ProcessStripeWebhookUseCase } from '../domains/shared/payments/application/use-cases/ProcessStripeWebhookUseCase';

// ============================================
// USE CASES - Shared - Auth
// ============================================
import { LoginUseCase } from '../domains/shared/auth/application/use-cases/LoginUseCase';
import { RegisterUseCase } from '../domains/shared/auth/application/use-cases/RegisterUseCase';
import { VerifyEmailUseCase } from '../domains/shared/auth/application/use-cases/VerifyEmailUseCase';
import { RequestPasswordResetUseCase } from '../domains/shared/auth/application/use-cases/RequestPasswordResetUseCase';
import { ResetPasswordUseCase } from '../domains/shared/auth/application/use-cases/ResetPasswordUseCase';

// ============================================
// USE CASES - Shared - Reports
// ============================================
import { GetOrdersReportUseCase } from '../domains/shared/reports/application/use-cases/GetOrdersReportUseCase';
import { ExportOrdersToCsvUseCase } from '../domains/shared/reports/application/use-cases/ExportOrdersToCsvUseCase';
import { GetInventoryReportUseCase } from '../domains/shared/reports/application/use-cases/GetInventoryReportUseCase';
import { GetDriversReportUseCase } from '../domains/shared/reports/application/use-cases/GetDriversReportUseCase';
import { GetDashboardKpisUseCase } from '../domains/shared/reports/application/use-cases/GetDashboardKpisUseCase';

// ============================================
// USE CASES - Retail - Storefront
// ============================================
import { ListStorefrontProductsUseCase } from '../domains/retail/storefront/application/use-cases/ListStorefrontProductsUseCase';
import { GetStorefrontProductUseCase } from '../domains/retail/storefront/application/use-cases/GetStorefrontProductUseCase';
import { GetStorefrontConfigUseCase } from '../domains/retail/storefront/application/use-cases/GetStorefrontConfigUseCase';
import { CheckoutUseCase } from '../domains/retail/storefront/application/use-cases/CheckoutUseCase';

// ============================================
// USE CASES - Delivery - Orders
// ============================================
import { CreateOnDemandOrderUseCase } from '../domains/delivery/orders/application/use-cases/CreateOnDemandOrderUseCase';
import { CreateRetailOrderUseCase } from '../domains/delivery/orders/application/use-cases/CreateRetailOrderUseCase';
import { GetOrderUseCase } from '../domains/delivery/orders/application/use-cases/GetOrderUseCase';
import { ListOrdersUseCase } from '../domains/delivery/orders/application/use-cases/ListOrdersUseCase';
import { AssignDriverUseCase } from '../domains/delivery/orders/application/use-cases/AssignDriverUseCase';
import { AssignLogisticsProviderUseCase } from '../domains/delivery/orders/application/use-cases/AssignLogisticsProviderUseCase';
import { MarkAsAutomaticUseCase } from '../domains/delivery/orders/application/use-cases/MarkAsAutomaticUseCase';
import { ChangeBranchUseCase } from '../domains/delivery/orders/application/use-cases/ChangeBranchUseCase';
import { UpdateOrderStatusUseCase } from '../domains/delivery/orders/application/use-cases/UpdateOrderStatusUseCase';
import { ModifyItemsUseCase } from '../domains/delivery/orders/application/use-cases/ModifyItemsUseCase';
import { RecalculateTotalsUseCase } from '../domains/delivery/orders/application/use-cases/RecalculateTotalsUseCase';
import { GetOrderByTrackingCodeUseCase } from '../domains/delivery/orders/application/use-cases/GetOrderByTrackingCodeUseCase';
import { AddDeliveryProofUseCase } from '../domains/delivery/orders/application/use-cases/AddDeliveryProofUseCase';
import { AddDeliveryRatingUseCase } from '../domains/delivery/orders/application/use-cases/AddDeliveryRatingUseCase';

// ============================================
// CONTROLLERS - Shared
// ============================================
import { TenantController } from '../domains/shared/tenants/presentation/controllers/TenantController';
import { UserController } from '../domains/shared/users/presentation/controllers/UserController';
import { BranchController } from '../domains/shared/branches/presentation/controllers/BranchController';
import { OrderCounterController } from '../domains/shared/order-counters/presentation/controllers/OrderCounterController';
import { SubscriptionPlanController } from '../domains/shared/subscription-plans/presentation/controllers/SubscriptionPlanController';

// ============================================
// CONTROLLERS - Shared - OAuth
// ============================================
import { OAuthClientController } from '../domains/shared/oauth/presentation/controllers/OAuthClientController';
import { OAuthController } from '../domains/shared/oauth/presentation/controllers/OAuthController';

// ============================================
// CONTROLLERS - Shared - Payments
// ============================================
import { PaymentController } from '../domains/shared/payments/presentation/controllers/PaymentController';
import { StripeWebhookController } from '../domains/shared/payments/presentation/controllers/StripeWebhookController';

// ============================================
// CONTROLLERS - Delivery
// ============================================
import { OrderController } from '../domains/delivery/orders/presentation/controllers/OrderController';
import { PublicOrderController } from '../domains/delivery/orders/presentation/controllers/PublicOrderController';
import { VehicleController } from '../domains/delivery/vehicles/presentation/controllers/VehicleController';
import { LogisticsProviderController } from '../domains/delivery/logistics-providers/presentation/controllers/LogisticsProviderController';
import { DriverController } from '../domains/delivery/drivers/presentation/controllers/DriverController';
import { DeliveryRateController } from '../domains/delivery/delivery-rates/presentation/controllers/DeliveryRateController';
import { DeliveryZoneController } from '../domains/delivery/delivery-zones/presentation/controllers/DeliveryZoneController';

// ============================================
// CONTROLLERS - Retail
// ============================================
import { CategoryController } from '../domains/retail/categories/presentation/controllers/CategoryController';
import { BrandController } from '../domains/retail/brands/presentation/controllers/BrandController';
import { ProductController } from '../domains/retail/products/presentation/controllers/ProductController';
import { ProductVariantController } from '../domains/retail/product-variants/presentation/controllers/ProductVariantController';
import { StorefrontController } from '../domains/retail/storefront/presentation/controllers/StorefrontController';

// ============================================
// CONTROLLERS - Shared - Auth
// ============================================
import { AuthController } from '../domains/shared/auth/presentation/controllers/AuthController';

// ============================================
// CONTROLLERS - Shared - Reports
// ============================================
import { ReportsController } from '../domains/shared/reports/presentation/controllers/ReportsController';

// ============================================
// CONTROLLERS - Shared - Subscriptions
// ============================================
import { SubscriptionController } from '../domains/shared/subscription-plans/presentation/controllers/SubscriptionController';

// ============================================
// CLIENTS
// ============================================
import { IDeliveryClient } from '../domains/retail/clients/IDeliveryClient';
import { DeliveryClient } from '../domains/retail/clients/DeliveryClient';

const container = new Container();

// ============================================
// PRISMA CLIENT (Singleton)
// ============================================
container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(new PrismaClient());

// ============================================
// REPOSITORIES - Shared
// ============================================
container.bind<ITenantRepository>(TYPES.ITenantRepository).to(PrismaTenantRepository);
container.bind<IUserRepository>(TYPES.IUserRepository).to(PrismaUserRepository);
container.bind<IBranchRepository>(TYPES.IBranchRepository).to(PrismaBranchRepository);
container
  .bind<IOrderCounterRepository>(TYPES.IOrderCounterRepository)
  .to(PrismaOrderCounterRepository);
container
  .bind<ISubscriptionPlanRepository>(TYPES.ISubscriptionPlanRepository)
  .to(PrismaSubscriptionPlanRepository);
container
  .bind<IOAuthClientRepository>(TYPES.IOAuthClientRepository)
  .to(PrismaOAuthClientRepository);
container
  .bind<IOAuthAuthorizationCodeRepository>(TYPES.IOAuthAuthorizationCodeRepository)
  .to(PrismaOAuthAuthorizationCodeRepository);
container.bind<IOAuthTokenRepository>(TYPES.IOAuthTokenRepository).to(PrismaOAuthTokenRepository);

// ============================================
// REPOSITORIES - Delivery
// ============================================
container.bind<IOrderRepository>(TYPES.IOrderRepository).to(PrismaOrderRepository);
container.bind<IDriverRepository>(TYPES.IDriverRepository).to(PrismaDriverRepository);
container.bind<IVehicleRepository>(TYPES.IVehicleRepository).to(PrismaVehicleRepository);
container
  .bind<ILogisticsProviderRepository>(TYPES.ILogisticsProviderRepository)
  .to(PrismaLogisticsProviderRepository);
container
  .bind<IDeliveryZoneRepository>(TYPES.IDeliveryZoneRepository)
  .to(PrismaDeliveryZoneRepository);
container
  .bind<IDeliveryRateRepository>(TYPES.IDeliveryRateRepository)
  .to(PrismaDeliveryRateRepository);
container
  .bind<IOrderPaymentTransactionRepository>(TYPES.IOrderPaymentTransactionRepository)
  .to(PrismaOrderPaymentTransactionRepository);

// ============================================
// REPOSITORIES - Retail
// ============================================
container.bind<IProductRepository>(TYPES.IProductRepository).to(PrismaProductRepository);
container
  .bind<IProductVariantRepository>(TYPES.IProductVariantRepository)
  .to(PrismaProductVariantRepository);
container.bind<ICategoryRepository>(TYPES.ICategoryRepository).to(PrismaCategoryRepository);
container.bind<IBrandRepository>(TYPES.IBrandRepository).to(PrismaBrandRepository);
container
  .bind<IStockByBranchRepository>(TYPES.IStockByBranchRepository)
  .to(PrismaStockByBranchRepository);
container
  .bind<IInventoryMovementRepository>(TYPES.IInventoryMovementRepository)
  .to(PrismaInventoryMovementRepository);

// ============================================
// REPOSITORIES - Payments
// ============================================
container
  .bind<IPaymentTransactionRepository>(TYPES.IPaymentTransactionRepository)
  .to(PrismaPaymentTransactionRepository);

// ============================================
// SERVICES - Shared
// ============================================
container.bind<AuthService>(TYPES.AuthService).to(AuthService);
container
  .bind<OrderNumberService>(TYPES.OrderNumberService)
  .to(OrderNumberService)
  .inSingletonScope();
container
  .bind<OAuthAuthorizationService>(TYPES.OAuthAuthorizationService)
  .to(OAuthAuthorizationService);
container.bind<OAuthTokenService>(TYPES.OAuthTokenService).to(OAuthTokenService);
container
  .bind<SubscriptionLimitService>(TYPES.SubscriptionLimitService)
  .to(SubscriptionLimitService);
container.bind<BillingService>(TYPES.BillingService).to(BillingService);

// ============================================
// SERVICES - Delivery
// ============================================
container.bind<DeliveryCostCalculator>(TYPES.DeliveryCostCalculator).to(DeliveryCostCalculator);

// ============================================
// SERVICES - Retail
// ============================================
container.bind<StockCalculator>(TYPES.StockCalculator).to(StockCalculator);
container.bind<StockReservationService>(TYPES.StockReservationService).to(StockReservationService);

// ============================================
// SERVICES - Payments
// ============================================
// StripeService necesita el secretKey del environment
container
  .bind<StripeService>(TYPES.StripeService)
  .toDynamicValue(() => {
    const secretKey = process.env.STRIPE_SECRET_KEY || '';
    return new StripeService(secretKey);
  })
  .inSingletonScope();

// ============================================
// SERVICES - Shared Utilities
// ============================================
container.bind<CurrencyService>(TYPES.CurrencyService).toConstantValue(new CurrencyService());
container.bind<typeof i18nService>(TYPES.I18nService).toConstantValue(i18nService);

// ============================================
// USE CASES - Shared - Tenants
// ============================================
container.bind<CreateTenantUseCase>(TYPES.CreateTenantUseCase).to(CreateTenantUseCase);
container.bind<GetTenantUseCase>(TYPES.GetTenantUseCase).to(GetTenantUseCase);
container.bind<ListTenantsUseCase>(TYPES.ListTenantsUseCase).to(ListTenantsUseCase);
container.bind<UpdateTenantUseCase>(TYPES.UpdateTenantUseCase).to(UpdateTenantUseCase);
container.bind<DeleteTenantUseCase>(TYPES.DeleteTenantUseCase).to(DeleteTenantUseCase);

// ============================================
// USE CASES - Shared - Users
// ============================================
container.bind<CreateUserUseCase>(TYPES.CreateUserUseCase).to(CreateUserUseCase);
container.bind<GetUserUseCase>(TYPES.GetUserUseCase).to(GetUserUseCase);
container.bind<ListUsersUseCase>(TYPES.ListUsersUseCase).to(ListUsersUseCase);
container.bind<UpdateUserUseCase>(TYPES.UpdateUserUseCase).to(UpdateUserUseCase);
container.bind<DeleteUserUseCase>(TYPES.DeleteUserUseCase).to(DeleteUserUseCase);

// ============================================
// USE CASES - Shared - Branches
// ============================================
container.bind<CreateBranchUseCase>(TYPES.CreateBranchUseCase).to(CreateBranchUseCase);
container.bind<GetBranchUseCase>(TYPES.GetBranchUseCase).to(GetBranchUseCase);
container.bind<ListBranchesUseCase>(TYPES.ListBranchesUseCase).to(ListBranchesUseCase);
container.bind<UpdateBranchUseCase>(TYPES.UpdateBranchUseCase).to(UpdateBranchUseCase);
container.bind<DeleteBranchUseCase>(TYPES.DeleteBranchUseCase).to(DeleteBranchUseCase);

// ============================================
// USE CASES - Shared - Order Counters
// ============================================
container
  .bind<CreateOrderCounterUseCase>(TYPES.CreateOrderCounterUseCase)
  .to(CreateOrderCounterUseCase);
container.bind<GetOrderCounterUseCase>(TYPES.GetOrderCounterUseCase).to(GetOrderCounterUseCase);
container
  .bind<UpdateOrderCounterUseCase>(TYPES.UpdateOrderCounterUseCase)
  .to(UpdateOrderCounterUseCase);
container
  .bind<IncrementOrderCounterUseCase>(TYPES.IncrementOrderCounterUseCase)
  .to(IncrementOrderCounterUseCase);

// ============================================
// USE CASES - Shared - Subscription Plans
// ============================================
container
  .bind<CreateSubscriptionPlanUseCase>(TYPES.CreateSubscriptionPlanUseCase)
  .to(CreateSubscriptionPlanUseCase);
container
  .bind<GetSubscriptionPlanUseCase>(TYPES.GetSubscriptionPlanUseCase)
  .to(GetSubscriptionPlanUseCase);
container
  .bind<ListSubscriptionPlansUseCase>(TYPES.ListSubscriptionPlansUseCase)
  .to(ListSubscriptionPlansUseCase);
container
  .bind<UpdateSubscriptionPlanUseCase>(TYPES.UpdateSubscriptionPlanUseCase)
  .to(UpdateSubscriptionPlanUseCase);
container
  .bind<DeleteSubscriptionPlanUseCase>(TYPES.DeleteSubscriptionPlanUseCase)
  .to(DeleteSubscriptionPlanUseCase);
container.bind<ChangeTenantPlanUseCase>(TYPES.ChangeTenantPlanUseCase).to(ChangeTenantPlanUseCase);
container.bind<StartTrialUseCase>(TYPES.StartTrialUseCase).to(StartTrialUseCase);
container
  .bind<ConvertTrialToPaidUseCase>(TYPES.ConvertTrialToPaidUseCase)
  .to(ConvertTrialToPaidUseCase);

// ============================================
// USE CASES - Delivery - Logistics Providers
// ============================================
container
  .bind<CreateLogisticsProviderUseCase>(TYPES.CreateLogisticsProviderUseCase)
  .to(CreateLogisticsProviderUseCase);
container
  .bind<GetLogisticsProviderUseCase>(TYPES.GetLogisticsProviderUseCase)
  .to(GetLogisticsProviderUseCase);
container
  .bind<ListLogisticsProvidersUseCase>(TYPES.ListLogisticsProvidersUseCase)
  .to(ListLogisticsProvidersUseCase);
container
  .bind<UpdateLogisticsProviderUseCase>(TYPES.UpdateLogisticsProviderUseCase)
  .to(UpdateLogisticsProviderUseCase);
container
  .bind<DeleteLogisticsProviderUseCase>(TYPES.DeleteLogisticsProviderUseCase)
  .to(DeleteLogisticsProviderUseCase);

// ============================================
// USE CASES - Delivery - Drivers
// ============================================
container.bind<CreateDriverUseCase>(TYPES.CreateDriverUseCase).to(CreateDriverUseCase);
container.bind<GetDriverUseCase>(TYPES.GetDriverUseCase).to(GetDriverUseCase);
container.bind<ListDriversUseCase>(TYPES.ListDriversUseCase).to(ListDriversUseCase);
container.bind<UpdateDriverUseCase>(TYPES.UpdateDriverUseCase).to(UpdateDriverUseCase);
container.bind<DeleteDriverUseCase>(TYPES.DeleteDriverUseCase).to(DeleteDriverUseCase);

// ============================================
// USE CASES - Delivery - Vehicles
// ============================================
container.bind<CreateVehicleUseCase>(TYPES.CreateVehicleUseCase).to(CreateVehicleUseCase);
container.bind<GetVehicleUseCase>(TYPES.GetVehicleUseCase).to(GetVehicleUseCase);
container.bind<ListVehiclesUseCase>(TYPES.ListVehiclesUseCase).to(ListVehiclesUseCase);
container.bind<UpdateVehicleUseCase>(TYPES.UpdateVehicleUseCase).to(UpdateVehicleUseCase);
container.bind<DeleteVehicleUseCase>(TYPES.DeleteVehicleUseCase).to(DeleteVehicleUseCase);

// ============================================
// USE CASES - Delivery - Delivery Zones
// ============================================
container
  .bind<CreateDeliveryZoneUseCase>(TYPES.CreateDeliveryZoneUseCase)
  .to(CreateDeliveryZoneUseCase);
container.bind<GetDeliveryZoneUseCase>(TYPES.GetDeliveryZoneUseCase).to(GetDeliveryZoneUseCase);
container
  .bind<ListDeliveryZonesUseCase>(TYPES.ListDeliveryZonesUseCase)
  .to(ListDeliveryZonesUseCase);
container
  .bind<UpdateDeliveryZoneUseCase>(TYPES.UpdateDeliveryZoneUseCase)
  .to(UpdateDeliveryZoneUseCase);
container
  .bind<DeleteDeliveryZoneUseCase>(TYPES.DeleteDeliveryZoneUseCase)
  .to(DeleteDeliveryZoneUseCase);

// ============================================
// USE CASES - Delivery - Delivery Rates
// ============================================
container
  .bind<CreateDeliveryRateUseCase>(TYPES.CreateDeliveryRateUseCase)
  .to(CreateDeliveryRateUseCase);
container.bind<GetDeliveryRateUseCase>(TYPES.GetDeliveryRateUseCase).to(GetDeliveryRateUseCase);
container
  .bind<ListDeliveryRatesUseCase>(TYPES.ListDeliveryRatesUseCase)
  .to(ListDeliveryRatesUseCase);
container
  .bind<UpdateDeliveryRateUseCase>(TYPES.UpdateDeliveryRateUseCase)
  .to(UpdateDeliveryRateUseCase);
container
  .bind<DeleteDeliveryRateUseCase>(TYPES.DeleteDeliveryRateUseCase)
  .to(DeleteDeliveryRateUseCase);

// ============================================
// USE CASES - Retail - Categories
// ============================================
container.bind<CreateCategoryUseCase>(TYPES.CreateCategoryUseCase).to(CreateCategoryUseCase);
container.bind<GetCategoryUseCase>(TYPES.GetCategoryUseCase).to(GetCategoryUseCase);
container.bind<ListCategoriesUseCase>(TYPES.ListCategoriesUseCase).to(ListCategoriesUseCase);
container.bind<UpdateCategoryUseCase>(TYPES.UpdateCategoryUseCase).to(UpdateCategoryUseCase);
container.bind<DeleteCategoryUseCase>(TYPES.DeleteCategoryUseCase).to(DeleteCategoryUseCase);

// ============================================
// USE CASES - Retail - Brands
// ============================================
container.bind<CreateBrandUseCase>(TYPES.CreateBrandUseCase).to(CreateBrandUseCase);
container.bind<GetBrandUseCase>(TYPES.GetBrandUseCase).to(GetBrandUseCase);
container.bind<ListBrandsUseCase>(TYPES.ListBrandsUseCase).to(ListBrandsUseCase);
container.bind<UpdateBrandUseCase>(TYPES.UpdateBrandUseCase).to(UpdateBrandUseCase);
container.bind<DeleteBrandUseCase>(TYPES.DeleteBrandUseCase).to(DeleteBrandUseCase);

// ============================================
// USE CASES - Retail - Products
// ============================================
container.bind<CreateProductUseCase>(TYPES.CreateProductUseCase).to(CreateProductUseCase);
container.bind<GetProductUseCase>(TYPES.GetProductUseCase).to(GetProductUseCase);
container.bind<ListProductsUseCase>(TYPES.ListProductsUseCase).to(ListProductsUseCase);
container.bind<UpdateProductUseCase>(TYPES.UpdateProductUseCase).to(UpdateProductUseCase);
container.bind<DeleteProductUseCase>(TYPES.DeleteProductUseCase).to(DeleteProductUseCase);

// ============================================
// USE CASES - Retail - Product Variants
// ============================================
container
  .bind<CreateProductVariantUseCase>(TYPES.CreateProductVariantUseCase)
  .to(CreateProductVariantUseCase);
container
  .bind<GetProductVariantUseCase>(TYPES.GetProductVariantUseCase)
  .to(GetProductVariantUseCase);
container
  .bind<ListProductVariantsUseCase>(TYPES.ListProductVariantsUseCase)
  .to(ListProductVariantsUseCase);
container
  .bind<UpdateProductVariantUseCase>(TYPES.UpdateProductVariantUseCase)
  .to(UpdateProductVariantUseCase);
container
  .bind<DeleteProductVariantUseCase>(TYPES.DeleteProductVariantUseCase)
  .to(DeleteProductVariantUseCase);

// ============================================
// USE CASES - Shared - OAuth
// ============================================
container
  .bind<CreateOAuthClientUseCase>(TYPES.CreateOAuthClientUseCase)
  .to(CreateOAuthClientUseCase);
container.bind<GetOAuthClientUseCase>(TYPES.GetOAuthClientUseCase).to(GetOAuthClientUseCase);
container.bind<ListOAuthClientsUseCase>(TYPES.ListOAuthClientsUseCase).to(ListOAuthClientsUseCase);
container
  .bind<UpdateOAuthClientUseCase>(TYPES.UpdateOAuthClientUseCase)
  .to(UpdateOAuthClientUseCase);
container
  .bind<DeleteOAuthClientUseCase>(TYPES.DeleteOAuthClientUseCase)
  .to(DeleteOAuthClientUseCase);

// ============================================
// USE CASES - Shared - Payments
// ============================================
container
  .bind<CreatePaymentTransactionUseCase>(TYPES.CreatePaymentTransactionUseCase)
  .to(CreatePaymentTransactionUseCase);
container
  .bind<ListPaymentTransactionsUseCase>(TYPES.ListPaymentTransactionsUseCase)
  .to(ListPaymentTransactionsUseCase);
container
  .bind<UpdatePaymentStatusUseCase>(TYPES.UpdatePaymentStatusUseCase)
  .to(UpdatePaymentStatusUseCase);
container
  .bind<CreateStripeCheckoutUseCase>(TYPES.CreateStripeCheckoutUseCase)
  .to(CreateStripeCheckoutUseCase);
container.bind<CreateRefundUseCase>(TYPES.CreateRefundUseCase).to(CreateRefundUseCase);
container
  .bind<ProcessStripeWebhookUseCase>(TYPES.ProcessStripeWebhookUseCase)
  .to(ProcessStripeWebhookUseCase);

// ============================================
// USE CASES - Delivery - Orders
// ============================================
container
  .bind<CreateOnDemandOrderUseCase>(TYPES.CreateOnDemandOrderUseCase)
  .to(CreateOnDemandOrderUseCase);
container
  .bind<CreateRetailOrderUseCase>(TYPES.CreateRetailOrderUseCase)
  .to(CreateRetailOrderUseCase);
container.bind<GetOrderUseCase>(TYPES.GetOrderUseCase).to(GetOrderUseCase);
container.bind<ListOrdersUseCase>(TYPES.ListOrdersUseCase).to(ListOrdersUseCase);
container.bind<AssignDriverUseCase>(TYPES.AssignDriverUseCase).to(AssignDriverUseCase);
container
  .bind<AssignLogisticsProviderUseCase>(TYPES.AssignLogisticsProviderUseCase)
  .to(AssignLogisticsProviderUseCase);
container.bind<MarkAsAutomaticUseCase>(TYPES.MarkAsAutomaticUseCase).to(MarkAsAutomaticUseCase);
container.bind<ChangeBranchUseCase>(TYPES.ChangeBranchUseCase).to(ChangeBranchUseCase);
container
  .bind<UpdateOrderStatusUseCase>(TYPES.UpdateOrderStatusUseCase)
  .to(UpdateOrderStatusUseCase);
container.bind<ModifyItemsUseCase>(TYPES.ModifyItemsUseCase).to(ModifyItemsUseCase);
container
  .bind<RecalculateTotalsUseCase>(TYPES.RecalculateTotalsUseCase)
  .to(RecalculateTotalsUseCase);
container
  .bind<GetOrderByTrackingCodeUseCase>(TYPES.GetOrderByTrackingCodeUseCase)
  .to(GetOrderByTrackingCodeUseCase);
container.bind<AddDeliveryProofUseCase>(TYPES.AddDeliveryProofUseCase).to(AddDeliveryProofUseCase);
container
  .bind<AddDeliveryRatingUseCase>(TYPES.AddDeliveryRatingUseCase)
  .to(AddDeliveryRatingUseCase);

// ============================================
// USE CASES - Shared - Auth
// ============================================
container.bind<LoginUseCase>(TYPES.LoginUseCase).to(LoginUseCase);
container.bind<RegisterUseCase>(TYPES.RegisterUseCase).to(RegisterUseCase);
container.bind<VerifyEmailUseCase>(TYPES.VerifyEmailUseCase).to(VerifyEmailUseCase);
container
  .bind<RequestPasswordResetUseCase>(TYPES.RequestPasswordResetUseCase)
  .to(RequestPasswordResetUseCase);
container.bind<ResetPasswordUseCase>(TYPES.ResetPasswordUseCase).to(ResetPasswordUseCase);

// ============================================
// USE CASES - Shared - Reports
// ============================================
container.bind<GetOrdersReportUseCase>(TYPES.GetOrdersReportUseCase).to(GetOrdersReportUseCase);
container
  .bind<ExportOrdersToCsvUseCase>(TYPES.ExportOrdersToCsvUseCase)
  .to(ExportOrdersToCsvUseCase);
container
  .bind<GetInventoryReportUseCase>(TYPES.GetInventoryReportUseCase)
  .to(GetInventoryReportUseCase);
container.bind<GetDriversReportUseCase>(TYPES.GetDriversReportUseCase).to(GetDriversReportUseCase);
container.bind<GetDashboardKpisUseCase>(TYPES.GetDashboardKpisUseCase).to(GetDashboardKpisUseCase);

// ============================================
// USE CASES - Retail - Storefront
// ============================================
container
  .bind<ListStorefrontProductsUseCase>(TYPES.ListStorefrontProductsUseCase)
  .to(ListStorefrontProductsUseCase);
container
  .bind<GetStorefrontProductUseCase>(TYPES.GetStorefrontProductUseCase)
  .to(GetStorefrontProductUseCase);
container
  .bind<GetStorefrontConfigUseCase>(TYPES.GetStorefrontConfigUseCase)
  .to(GetStorefrontConfigUseCase);
container.bind<CheckoutUseCase>(TYPES.CheckoutUseCase).to(CheckoutUseCase);

// ============================================
// CONTROLLERS - Shared
// ============================================
container.bind<TenantController>(TYPES.TenantController).to(TenantController);
container.bind<UserController>(TYPES.UserController).to(UserController);
container.bind<BranchController>(TYPES.BranchController).to(BranchController);
container.bind<OrderCounterController>(TYPES.OrderCounterController).to(OrderCounterController);
container
  .bind<SubscriptionPlanController>(TYPES.SubscriptionPlanController)
  .to(SubscriptionPlanController);

// ============================================
// CONTROLLERS - Shared - OAuth
// ============================================
container.bind<OAuthClientController>(TYPES.OAuthClientController).to(OAuthClientController);
container.bind<OAuthController>(TYPES.OAuthController).to(OAuthController);

// ============================================
// CONTROLLERS - Shared - Payments
// ============================================
container.bind<PaymentController>(TYPES.PaymentController).to(PaymentController);
container.bind<StripeWebhookController>(TYPES.StripeWebhookController).to(StripeWebhookController);

// ============================================
// CONTROLLERS - Delivery
// ============================================
container.bind<OrderController>(TYPES.OrderController).to(OrderController);
container.bind<PublicOrderController>(TYPES.PublicOrderController).to(PublicOrderController);
container.bind<VehicleController>(TYPES.VehicleController).to(VehicleController);
container
  .bind<LogisticsProviderController>(TYPES.LogisticsProviderController)
  .to(LogisticsProviderController);
container.bind<DriverController>(TYPES.DriverController).to(DriverController);
container.bind<DeliveryRateController>(TYPES.DeliveryRateController).to(DeliveryRateController);
container.bind<DeliveryZoneController>(TYPES.DeliveryZoneController).to(DeliveryZoneController);

// ============================================
// CONTROLLERS - Retail
// ============================================
container.bind<CategoryController>(TYPES.CategoryController).to(CategoryController);
container.bind<BrandController>(TYPES.BrandController).to(BrandController);
container.bind<ProductController>(TYPES.ProductController).to(ProductController);
container
  .bind<ProductVariantController>(TYPES.ProductVariantController)
  .to(ProductVariantController);
container.bind<StorefrontController>(TYPES.StorefrontController).to(StorefrontController);

// ============================================
// CONTROLLERS - Shared - Auth
// ============================================
container.bind<AuthController>(TYPES.AuthController).to(AuthController);

// ============================================
// CONTROLLERS - Shared - Reports
// ============================================
container.bind<ReportsController>(TYPES.ReportsController).to(ReportsController);

// ============================================
// CONTROLLERS - Shared - Subscriptions
// ============================================
container.bind<SubscriptionController>(TYPES.SubscriptionController).to(SubscriptionController);

// ============================================
// CLIENTS
// ============================================
container.bind<IDeliveryClient>(TYPES.DeliveryClient).to(DeliveryClient).inSingletonScope();

export { container };
