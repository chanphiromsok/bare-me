import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CustomerDetailScreen from "../screens/customers/CustomerDetailScreen";
import CustomersScreen from "../screens/customers/CustomersScreen";
import NewCustomerScreen from "../screens/customers/NewCustomerScreen";

const CustomersStack = createNativeStackNavigator({
  screenOptions: { animation: "slide_from_right", headerShown: false },
  screens: {
    CustomerList: CustomersScreen,
    CustomerDetail: CustomerDetailScreen,
    NewCustomer: NewCustomerScreen,
  },
});

export type CustomersStackParamList = {
  CustomerDetail: { customerId: string };
  CustomerList: undefined;
  NewCustomer: undefined;
};

export default CustomersStack;
