import { createNativeStackNavigator } from "@react-navigation/native-stack";

import NewProductScreen from "../screens/products/NewProductScreen";
import ProductDetailScreen from "../screens/products/ProductDetailScreen";
import ProductsScreen from "../screens/products/ProductsScreen";
import RestockScreen from "../screens/products/RestockScreen";

const ProductsStack = createNativeStackNavigator({
  screenOptions: { animation: "slide_from_right", headerShown: false },
  screens: {
    ProductList: ProductsScreen,
    ProductDetail: ProductDetailScreen,
    NewProduct: NewProductScreen,
    Restock: RestockScreen,
  },
});

export type ProductsStackParamList = {
  NewProduct: undefined;
  ProductDetail: { productId: string };
  ProductList: undefined;
  Restock: undefined;
};

export default ProductsStack;
