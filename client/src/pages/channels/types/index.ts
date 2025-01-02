interface RestaurantData {
  restaurantId: string;
  serverTime: string;
  isOpen: boolean;
  lastCachePollTime: number;
  batches: Batch[];
  lastOrderEventTimestamps: { [key: string]: string };
  isServiceable: boolean;
  stressInfo: {
    stress: boolean;
  };
  updatedOrderIds: string[];
  orders: Order[];
  popOrders: [];
}

interface Order {
  last_updated_time: string;
  order_id: string;
  prep_time_predicted: number;
  status: {
    order_status: string;
    placed_status: string;
    placingState: string;
    delivery_status: string;
    placed_time: string | null;
    call_partner_time: string | null;
    ordered_time: string;
    edited_status: string;
    edited_time: string | null;
    food_prep_time: string | null;
    cancelled_time: string | null;
    order_handover_window: number;
    early_mfr_time: number;
    hand_over_delayed: boolean;
  };
  current_order_action: string;
  delivery_boy: DeliveryBoy;
  customer_comment: string;
  customer_area: string;
  customer_distance: number;
  restaurant_details: {
    restaurant_lat: string;
    restaurant_lng: string;
    categories: [];
  };
  cart: {
    charges: {
      packing_charge: number;
    };
    items: Item[];
  };
  restaurant_taxation_type: string;
  GST_details: {
    cartCGST: number;
    cartIGST: number;
    cartSGST: number;
    itemCGST: number;
    itemIGST: number;
    packagingCGST: number;
    packagingSGST: number;
    restaurant_liable_gst: number;
    swiggy_liable_gst: number;
  };
  gst: number;
  serviceCharge: number;
  spending: number;
  tax: number;
  discount: number;
  bill: number;
  restaurant_trade_discount: number | null;
  total_restaurant_discount: number;
  type: string;
  cafe_data: {
    restaurant_type: string | null;
  };
  is_assured: boolean;
  discount_descriptions: [];
  delivery: {
    promiseId: string;
  };
  outlier_meta: {
    has_complaint_outliers: boolean;
  };
  final_gp_price: number;
  customer: {
    customer_id: string;
    customer_lat: string;
    customer_lng: string;
    customer_name: string;
  };
  prep_time_details: {
    predicted_prep_time: number;
    max_increase_threshold: number;
    max_decrease_threshold: number;
  };
  order_expiry_time: string;
  is_prep_timer_enabled: boolean;
  isMFRAccuracyCalculated: boolean;
  rest_extra_prep_time: number | null;
  promise_prep_time: number | null;
  foodHandoverTimeSec: number;
  onDemandEnricherFlags: {
    shouldQueryOutliers: boolean;
  };
}

interface Item {
  item_id: string;
  quantity: number;
  name: string;
  restaurant_discount_hit: number;
  final_sub_total: number;
  sub_total: number;
  total: number;
  category: string;
  sub_category: string;
  charges: {
    ServiceCharges: string;
    GST: string;
    Vat: string;
    ServiceTax: string;
  };
  tax_expressions: {
    GST_inclusive: boolean;
    ServiceCharges: string;
    Vat: string;
    ServiceTax: string;
  };
  addons: [];
  variants: string;
  newAddons: [];
  newVariants: [];
  is_oos: boolean;
  is_veg: string;
  reward_type: string | null;
  free_quantity: number;
}

export interface OrderResponse {
  statusCode: number;
  statusMessage: string;
  restaurantData: RestaurantData[];
  force_update: number;
  optional_update: number;
  battery_status_time: number;
  config: {
    pollingInterval: string;
  };
}

interface DeliveryBoy {
  [key: string]: string;
}

interface Batch {
  [key: string]: string;
  [key: number]: string;
}

export interface Channel {
  id: number;
  uniqueId: string;
  swiggyRestaurantId: string;
  swiggyStatus: boolean;
  zomatoRestaurantId: string;
  zomatoStatus: boolean;
  apiAccessToken: string | null;
  restaurant: string;
  restaurantId: string;
}
