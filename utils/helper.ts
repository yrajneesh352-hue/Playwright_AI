export class Helper {
  static convertPriceToNumber(price: string): number {
    return Number(price.replace(/[^\d.]/g, ''));
  }

  static getProductDetails() {
    return {
      productName: "MacBook",
      productQuantity: "1",
      totalPrice: "$602.00",
    };
  }

  static getInStockProductDetails() {
    return {
      productName: "Samsung SyncMaster 941BW",
      productQuantity: "1",
    };
  }

  static getLoginDetails() {
    return {
      email: "pavanol@xyz.com",
      password: "test@123",
    };
  }
}
