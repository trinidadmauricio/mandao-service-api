/**
 * Symbols para InversifyJS
 * Todos los bindings necesarios para Dependency Injection
 */

export const TYPES = {
  // Prisma Client
  PrismaClient: Symbol.for('PrismaClient'),

  // ============================================
  // REPOSITORIES - Shared
  // ============================================
  ITenantRepository: Symbol.for('ITenantRepository'),
  IUserRepository: Symbol.for('IUserRepository'),
  IBranchRepository: Symbol.for('IBranchRepository'),
  IOrderCounterRepository: Symbol.for('IOrderCounterRepository'),
  ISubscriptionPlanRepository: Symbol.for('ISubscriptionPlanRepository'),
  IOAuthClientRepository: Symbol.for('IOAuthClientRepository'),
  IOAuthAuthorizationCodeRepository: Symbol.for('IOAuthAuthorizationCodeRepository'),
  IOAuthTokenRepository: Symbol.for('IOAuthTokenRepository'),
  CustomerAddressRepository: Symbol.for('CustomerAddressRepository'),

  // ============================================
  // REPOSITORIES - Delivery
  // ============================================
  IOrderRepository: Symbol.for('IOrderRepository'),
  IDriverRepository: Symbol.for('IDriverRepository'),
  IVehicleRepository: Symbol.for('IVehicleRepository'),
  ILogisticsProviderRepository: Symbol.for('ILogisticsProviderRepository'),
  IDeliveryZoneRepository: Symbol.for('IDeliveryZoneRepository'),
  IDeliveryRateRepository: Symbol.for('IDeliveryRateRepository'),
  IOrderPaymentTransactionRepository: Symbol.for('IOrderPaymentTransactionRepository'),

  // ============================================
  // REPOSITORIES - Retail
  // ============================================
  IProductRepository: Symbol.for('IProductRepository'),
  IProductVariantRepository: Symbol.for('IProductVariantRepository'),
  ICategoryRepository: Symbol.for('ICategoryRepository'),
  IBrandRepository: Symbol.for('IBrandRepository'),
  IStockByBranchRepository: Symbol.for('IStockByBranchRepository'),
  IInventoryMovementRepository: Symbol.for('IInventoryMovementRepository'),
  ICartRepository: Symbol.for('ICartRepository'),

  // ============================================
  // REPOSITORIES - Payments
  // ============================================
  IPaymentTransactionRepository: Symbol.for('IPaymentTransactionRepository'),

  // ============================================
  // SERVICES - Shared
  // ============================================
  AuthService: Symbol.for('AuthService'),
  OrderNumberService: Symbol.for('OrderNumberService'),
  OAuthAuthorizationService: Symbol.for('OAuthAuthorizationService'),
  OAuthTokenService: Symbol.for('OAuthTokenService'),
  SubscriptionLimitService: Symbol.for('SubscriptionLimitService'),
  BillingService: Symbol.for('BillingService'),

  // ============================================
  // SERVICES - Delivery
  // ============================================
  DeliveryCostCalculator: Symbol.for('DeliveryCostCalculator'),

  // ============================================
  // SERVICES - Retail
  // ============================================
  StockCalculator: Symbol.for('StockCalculator'),
  StockReservationService: Symbol.for('StockReservationService'),

  // ============================================
  // SERVICES - Payments
  // ============================================
  StripeService: Symbol.for('StripeService'),

  // ============================================
  // SERVICES - Shared Utilities
  // ============================================
  CurrencyService: Symbol.for('CurrencyService'),
  I18nService: Symbol.for('I18nService'),

  // ============================================
  // USE CASES - Shared - Tenants
  // ============================================
  CreateTenantUseCase: Symbol.for('CreateTenantUseCase'),
  GetTenantUseCase: Symbol.for('GetTenantUseCase'),
  ListTenantsUseCase: Symbol.for('ListTenantsUseCase'),
  UpdateTenantUseCase: Symbol.for('UpdateTenantUseCase'),
  DeleteTenantUseCase: Symbol.for('DeleteTenantUseCase'),

  // ============================================
  // USE CASES - Shared - Users
  // ============================================
  CreateUserUseCase: Symbol.for('CreateUserUseCase'),
  GetUserUseCase: Symbol.for('GetUserUseCase'),
  ListUsersUseCase: Symbol.for('ListUsersUseCase'),
  UpdateUserUseCase: Symbol.for('UpdateUserUseCase'),
  DeleteUserUseCase: Symbol.for('DeleteUserUseCase'),

  // ============================================
  // USE CASES - Shared - Customer Addresses
  // ============================================
  GetCustomerAddressesUseCase: Symbol.for('GetCustomerAddressesUseCase'),
  GetCustomerAddressUseCase: Symbol.for('GetCustomerAddressUseCase'),
  CreateCustomerAddressUseCase: Symbol.for('CreateCustomerAddressUseCase'),
  UpdateCustomerAddressUseCase: Symbol.for('UpdateCustomerAddressUseCase'),
  DeleteCustomerAddressUseCase: Symbol.for('DeleteCustomerAddressUseCase'),

  // ============================================
  // USE CASES - Shared - Branches
  // ============================================
  CreateBranchUseCase: Symbol.for('CreateBranchUseCase'),
  GetBranchUseCase: Symbol.for('GetBranchUseCase'),
  ListBranchesUseCase: Symbol.for('ListBranchesUseCase'),
  UpdateBranchUseCase: Symbol.for('UpdateBranchUseCase'),
  DeleteBranchUseCase: Symbol.for('DeleteBranchUseCase'),

  // ============================================
  // USE CASES - Shared - Order Counters
  // ============================================
  CreateOrderCounterUseCase: Symbol.for('CreateOrderCounterUseCase'),
  GetOrderCounterUseCase: Symbol.for('GetOrderCounterUseCase'),
  UpdateOrderCounterUseCase: Symbol.for('UpdateOrderCounterUseCase'),
  IncrementOrderCounterUseCase: Symbol.for('IncrementOrderCounterUseCase'),

  // ============================================
  // USE CASES - Shared - Subscription Plans
  // ============================================
  CreateSubscriptionPlanUseCase: Symbol.for('CreateSubscriptionPlanUseCase'),
  GetSubscriptionPlanUseCase: Symbol.for('GetSubscriptionPlanUseCase'),
  ListSubscriptionPlansUseCase: Symbol.for('ListSubscriptionPlansUseCase'),
  UpdateSubscriptionPlanUseCase: Symbol.for('UpdateSubscriptionPlanUseCase'),
  DeleteSubscriptionPlanUseCase: Symbol.for('DeleteSubscriptionPlanUseCase'),
  ChangeTenantPlanUseCase: Symbol.for('ChangeTenantPlanUseCase'),
  StartTrialUseCase: Symbol.for('StartTrialUseCase'),
  ConvertTrialToPaidUseCase: Symbol.for('ConvertTrialToPaidUseCase'),

  // ============================================
  // USE CASES - Shared - Auth
  // ============================================
  LoginUseCase: Symbol.for('LoginUseCase'),
  RegisterUseCase: Symbol.for('RegisterUseCase'),
  VerifyEmailUseCase: Symbol.for('VerifyEmailUseCase'),
  RequestPasswordResetUseCase: Symbol.for('RequestPasswordResetUseCase'),
  ResetPasswordUseCase: Symbol.for('ResetPasswordUseCase'),

  // ============================================
  // USE CASES - Shared - OAuth Clients
  // ============================================
  CreateOAuthClientUseCase: Symbol.for('CreateOAuthClientUseCase'),
  GetOAuthClientUseCase: Symbol.for('GetOAuthClientUseCase'),
  ListOAuthClientsUseCase: Symbol.for('ListOAuthClientsUseCase'),
  UpdateOAuthClientUseCase: Symbol.for('UpdateOAuthClientUseCase'),
  DeleteOAuthClientUseCase: Symbol.for('DeleteOAuthClientUseCase'),

  // ============================================
  // USE CASES - Shared - Reports
  // ============================================
  GetOrdersReportUseCase: Symbol.for('GetOrdersReportUseCase'),
  GetInventoryReportUseCase: Symbol.for('GetInventoryReportUseCase'),
  GetDriversReportUseCase: Symbol.for('GetDriversReportUseCase'),
  GetDashboardKpisUseCase: Symbol.for('GetDashboardKpisUseCase'),
  ExportOrdersToCsvUseCase: Symbol.for('ExportOrdersToCsvUseCase'),

  // ============================================
  // USE CASES - Shared - Payments
  // ============================================
  CreatePaymentTransactionUseCase: Symbol.for('CreatePaymentTransactionUseCase'),
  ListPaymentTransactionsUseCase: Symbol.for('ListPaymentTransactionsUseCase'),
  UpdatePaymentStatusUseCase: Symbol.for('UpdatePaymentStatusUseCase'),
  CreateStripeCheckoutUseCase: Symbol.for('CreateStripeCheckoutUseCase'),
  ProcessStripeWebhookUseCase: Symbol.for('ProcessStripeWebhookUseCase'),
  CreateRefundUseCase: Symbol.for('CreateRefundUseCase'),

  // ============================================
  // USE CASES - Delivery - Logistics Providers
  // ============================================
  CreateLogisticsProviderUseCase: Symbol.for('CreateLogisticsProviderUseCase'),
  GetLogisticsProviderUseCase: Symbol.for('GetLogisticsProviderUseCase'),
  ListLogisticsProvidersUseCase: Symbol.for('ListLogisticsProvidersUseCase'),
  UpdateLogisticsProviderUseCase: Symbol.for('UpdateLogisticsProviderUseCase'),
  DeleteLogisticsProviderUseCase: Symbol.for('DeleteLogisticsProviderUseCase'),

  // ============================================
  // USE CASES - Delivery - Drivers
  // ============================================
  CreateDriverUseCase: Symbol.for('CreateDriverUseCase'),
  GetDriverUseCase: Symbol.for('GetDriverUseCase'),
  ListDriversUseCase: Symbol.for('ListDriversUseCase'),
  UpdateDriverUseCase: Symbol.for('UpdateDriverUseCase'),
  DeleteDriverUseCase: Symbol.for('DeleteDriverUseCase'),

  // ============================================
  // USE CASES - Delivery - Vehicles
  // ============================================
  CreateVehicleUseCase: Symbol.for('CreateVehicleUseCase'),
  GetVehicleUseCase: Symbol.for('GetVehicleUseCase'),
  ListVehiclesUseCase: Symbol.for('ListVehiclesUseCase'),
  UpdateVehicleUseCase: Symbol.for('UpdateVehicleUseCase'),
  DeleteVehicleUseCase: Symbol.for('DeleteVehicleUseCase'),

  // ============================================
  // USE CASES - Delivery - Delivery Zones
  // ============================================
  CreateDeliveryZoneUseCase: Symbol.for('CreateDeliveryZoneUseCase'),
  GetDeliveryZoneUseCase: Symbol.for('GetDeliveryZoneUseCase'),
  ListDeliveryZonesUseCase: Symbol.for('ListDeliveryZonesUseCase'),
  UpdateDeliveryZoneUseCase: Symbol.for('UpdateDeliveryZoneUseCase'),
  DeleteDeliveryZoneUseCase: Symbol.for('DeleteDeliveryZoneUseCase'),

  // ============================================
  // USE CASES - Delivery - Delivery Rates
  // ============================================
  CreateDeliveryRateUseCase: Symbol.for('CreateDeliveryRateUseCase'),
  GetDeliveryRateUseCase: Symbol.for('GetDeliveryRateUseCase'),
  ListDeliveryRatesUseCase: Symbol.for('ListDeliveryRatesUseCase'),
  UpdateDeliveryRateUseCase: Symbol.for('UpdateDeliveryRateUseCase'),
  DeleteDeliveryRateUseCase: Symbol.for('DeleteDeliveryRateUseCase'),

  // ============================================
  // USE CASES - Delivery - Orders
  // ============================================
  CreateOnDemandOrderUseCase: Symbol.for('CreateOnDemandOrderUseCase'),
  CreateRetailOrderUseCase: Symbol.for('CreateRetailOrderUseCase'),
  GetOrderUseCase: Symbol.for('GetOrderUseCase'),
  GetOrderByTrackingCodeUseCase: Symbol.for('GetOrderByTrackingCodeUseCase'),
  ListOrdersUseCase: Symbol.for('ListOrdersUseCase'),
  UpdateOrderStatusUseCase: Symbol.for('UpdateOrderStatusUseCase'),
  AssignDriverUseCase: Symbol.for('AssignDriverUseCase'),
  AssignLogisticsProviderUseCase: Symbol.for('AssignLogisticsProviderUseCase'),
  MarkAsAutomaticUseCase: Symbol.for('MarkAsAutomaticUseCase'),
  ChangeBranchUseCase: Symbol.for('ChangeBranchUseCase'),
  ModifyItemsUseCase: Symbol.for('ModifyItemsUseCase'),
  RecalculateTotalsUseCase: Symbol.for('RecalculateTotalsUseCase'),
  AddDeliveryProofUseCase: Symbol.for('AddDeliveryProofUseCase'),
  AddDeliveryRatingUseCase: Symbol.for('AddDeliveryRatingUseCase'),

  // ============================================
  // USE CASES - Retail - Categories
  // ============================================
  CreateCategoryUseCase: Symbol.for('CreateCategoryUseCase'),
  GetCategoryUseCase: Symbol.for('GetCategoryUseCase'),
  ListCategoriesUseCase: Symbol.for('ListCategoriesUseCase'),
  UpdateCategoryUseCase: Symbol.for('UpdateCategoryUseCase'),
  DeleteCategoryUseCase: Symbol.for('DeleteCategoryUseCase'),

  // ============================================
  // USE CASES - Retail - Brands
  // ============================================
  CreateBrandUseCase: Symbol.for('CreateBrandUseCase'),
  GetBrandUseCase: Symbol.for('GetBrandUseCase'),
  ListBrandsUseCase: Symbol.for('ListBrandsUseCase'),
  UpdateBrandUseCase: Symbol.for('UpdateBrandUseCase'),
  DeleteBrandUseCase: Symbol.for('DeleteBrandUseCase'),

  // ============================================
  // USE CASES - Retail - Products
  // ============================================
  CreateProductUseCase: Symbol.for('CreateProductUseCase'),
  GetProductUseCase: Symbol.for('GetProductUseCase'),
  ListProductsUseCase: Symbol.for('ListProductsUseCase'),
  UpdateProductUseCase: Symbol.for('UpdateProductUseCase'),
  DeleteProductUseCase: Symbol.for('DeleteProductUseCase'),

  // ============================================
  // USE CASES - Retail - Product Variants
  // ============================================
  CreateProductVariantUseCase: Symbol.for('CreateProductVariantUseCase'),
  GetProductVariantUseCase: Symbol.for('GetProductVariantUseCase'),
  ListProductVariantsUseCase: Symbol.for('ListProductVariantsUseCase'),
  UpdateProductVariantUseCase: Symbol.for('UpdateProductVariantUseCase'),
  DeleteProductVariantUseCase: Symbol.for('DeleteProductVariantUseCase'),

  // ============================================
  // USE CASES - Retail - Storefront
  // ============================================
  ListStorefrontProductsUseCase: Symbol.for('ListStorefrontProductsUseCase'),
  GetStorefrontProductUseCase: Symbol.for('GetStorefrontProductUseCase'),
  GetStorefrontConfigUseCase: Symbol.for('GetStorefrontConfigUseCase'),
  ListStorefrontCategoriesUseCase: Symbol.for('ListStorefrontCategoriesUseCase'),
  GetStorefrontCategoryBySlugUseCase: Symbol.for('GetStorefrontCategoryBySlugUseCase'),
  ListStorefrontBrandsUseCase: Symbol.for('ListStorefrontBrandsUseCase'),
  CheckoutUseCase: Symbol.for('CheckoutUseCase'),

  // ============================================
  // USE CASES - Retail - Cart
  // ============================================
  GetCartUseCase: Symbol.for('GetCartUseCase'),
  AddCartItemUseCase: Symbol.for('AddCartItemUseCase'),
  UpdateCartItemUseCase: Symbol.for('UpdateCartItemUseCase'),
  RemoveCartItemUseCase: Symbol.for('RemoveCartItemUseCase'),
  ClearCartUseCase: Symbol.for('ClearCartUseCase'),

  // ============================================
  // CONTROLLERS - Shared
  // ============================================
  TenantController: Symbol.for('TenantController'),
  UserController: Symbol.for('UserController'),
  BranchController: Symbol.for('BranchController'),
  OrderCounterController: Symbol.for('OrderCounterController'),
  SubscriptionPlanController: Symbol.for('SubscriptionPlanController'),
  AuthController: Symbol.for('AuthController'),
  OAuthController: Symbol.for('OAuthController'),
  OAuthClientController: Symbol.for('OAuthClientController'),
  ReportsController: Symbol.for('ReportsController'),
  PaymentController: Symbol.for('PaymentController'),
  StripeWebhookController: Symbol.for('StripeWebhookController'),
  SubscriptionController: Symbol.for('SubscriptionController'),

  // ============================================
  // CONTROLLERS - Delivery
  // ============================================
  LogisticsProviderController: Symbol.for('LogisticsProviderController'),
  DriverController: Symbol.for('DriverController'),
  VehicleController: Symbol.for('VehicleController'),
  DeliveryZoneController: Symbol.for('DeliveryZoneController'),
  DeliveryRateController: Symbol.for('DeliveryRateController'),
  OrderController: Symbol.for('OrderController'),
  PublicOrderController: Symbol.for('PublicOrderController'),

  // ============================================
  // CONTROLLERS - Retail
  // ============================================
  CategoryController: Symbol.for('CategoryController'),
  BrandController: Symbol.for('BrandController'),
  ProductController: Symbol.for('ProductController'),
  ProductVariantController: Symbol.for('ProductVariantController'),
  StorefrontController: Symbol.for('StorefrontController'),
  CartController: Symbol.for('CartController'),
  CustomerAddressController: Symbol.for('CustomerAddressController'),

  // ============================================
  // CLIENTS
  // ============================================
  DeliveryClient: Symbol.for('DeliveryClient'),
} as const;
