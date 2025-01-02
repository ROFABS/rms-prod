import FlexContainer from "@/components/layout/FlexContainer";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/lib/api/api";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL, Roles } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { printKOT, printSession } from "@/lib/printer/printer";
import { UsbNavigator } from "@/lib/printer/types";
import { calculateItemTax, cn, debounce } from "@/lib/utils";
import { useGlobalContext } from "@/store/GlobalContext";
import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import axios from "axios";
import { Form, Formik, FormikHelpers } from "formik";
import {
  ArrowLeft,
  Check,
  Loader,
  Minus,
  Pencil,
  Plus,
  Trash,
  XIcon,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { User } from "../users/types/user";
import { Tax } from "./config/types";
import { KsrSession } from "./session/types";
import { KsrCategoryItem, KsrOrder, KsrPayment } from "./types";

interface FormValues {
  type_of_sale: string;
  restaurantId: string;
  table_id: string;
  delivery_partner: string;
  role: string;
}

interface SelectedItem {
  uniqueId: string;
  productName: string;
  quantity: number;
  price: number;
  taxAmount: number;
}

const CreateOrder = () => {
  const {
    user,
    device,
    setError,
    selectedRestaurant,
    // setSelectedTables,
    selectedTables,
  } = useGlobalContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");
  const typeOfSale = searchParams.get("typeOfSale");

  const [initialValue, setInitialValue] = useState<FormValues>({
    type_of_sale: "",
    restaurantId: "",
    table_id: "",
    delivery_partner: "",
    role: "",
  });
  const [userRole, setUserRole] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]); //selected items
  const [query, setQuery] = useState(""); //search query
  const [filteredItems, setFilteredItems] = useState<KsrCategoryItem[]>([]); //filtered items
  const [items, setItems] = useState<KsrCategoryItem[]>([]); //items

  const [discountForm, setDiscountForm] = useState({
    discountType: "flat",
    discountAmount: "0",
  });
  const [extraDiscount, setExtraDiscount] = useState({
    discountType: "flat",
    discount: "0",
    discountAmount: "0",
  });

  const [discountAmount, setDiscountAmount] = useState(0); //discount amount
  const subTotal = selectedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const totalTax = selectedItems.reduce((acc, item) => acc + item.taxAmount, 0);

  //loading states
  const [cancellingKOT, setCancellingKOT] = useState(false);
  const [settlingBill, setSettlingBill] = useState(false);
  const [deletingProductItem, setDeletingProductItem] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();

  const {
    data: dishData,
    error: dishError,
    loading: dishLoading,
    getData: getDishData,
    refresh: refreshDishData,
    invalidateCache,
  } = useGet<KsrCategoryItem[]>({ showToast: false });

  const {
    data: sessionData,
    error: sessionError,
    loading: sessionLoading,
    invalidateCache: invalidateSessionData,
    refresh: refreshSessionData,
    getData: getSessionData,
  } = useGet<KsrSession>({ showToast: false });

  const handleAddItem = (item: KsrCategoryItem) => {
    const index = selectedItems.findIndex(
      (selectedItem) => selectedItem?.uniqueId === item?.uniqueId
    );
    if (index === -1) {
      setSelectedItems([
        ...selectedItems,
        {
          uniqueId: item?.uniqueId,
          productName: item.productName,
          quantity: 1,
          price: item.price,
          taxAmount: calculateItemTax(item.tax, item.price),
        },
      ]);
    } else {
      const newSelectedItems = [...selectedItems];
      newSelectedItems[index].quantity = newSelectedItems[index].quantity
        ? newSelectedItems[index].quantity + 1
        : 1;
      newSelectedItems[index].taxAmount = newSelectedItems[index].taxAmount
        ? newSelectedItems[index].taxAmount +
          calculateItemTax(item.tax, item.price)
        : calculateItemTax(item.tax, item.price);
      setSelectedItems(newSelectedItems);
    }
  };

  const handleRemoveItems = (item: KsrCategoryItem) => {
    const index = selectedItems.findIndex(
      (selectedItem) => selectedItem?.uniqueId === item?.uniqueId
    );
    if (index === -1) {
      return;
    } else {
      if (selectedItems[index].quantity === 1) {
        const newSelectedItems = selectedItems.filter(
          (selectedItem) => selectedItem?.uniqueId !== item?.uniqueId
        );
        setSelectedItems(newSelectedItems);
      } else {
        const newSelectedItems = [...selectedItems];
        newSelectedItems[index].quantity = newSelectedItems[index].quantity
          ? newSelectedItems[index].quantity - 1
          : 0;
        newSelectedItems[index].taxAmount = newSelectedItems[index].taxAmount
          ? newSelectedItems[index].taxAmount -
            calculateItemTax(item.tax, item.price)
          : 0;
        setSelectedItems(newSelectedItems);
      }
    }
  };

  const handleQuantityChange = (quantity: number, product: KsrCategoryItem) => {
    if (quantity === 0) {
      const newSelectedItems = selectedItems.filter(
        (selectedItem) => selectedItem?.uniqueId !== product?.uniqueId
      );
      setSelectedItems(newSelectedItems);
      return;
    }
    const index = selectedItems.findIndex(
      (selectedItem) => selectedItem?.uniqueId === product?.uniqueId
    );
    if (index === -1) {
      const newSelectedItems = [
        ...selectedItems,
        {
          uniqueId: product?.uniqueId,
          productName: product.productName,
          quantity: quantity,
          price: product.price,
          taxAmount: calculateItemTax(product.tax, product.price) * quantity,
        },
      ];
      setSelectedItems(newSelectedItems);
      return;
    } else {
      const newSelectedItems = [...selectedItems];

      const price = product.price;
      const taxAmount = calculateItemTax(product.tax, price);
      newSelectedItems[index].quantity = quantity;
      newSelectedItems[index].taxAmount = taxAmount * quantity;
      setSelectedItems(newSelectedItems);
    }
  };

  const handleSubmit = async (
    values: FormValues,
    actions: FormikHelpers<FormValues>
  ) => {
    if (!user) {
      toast.error("Please login to create order");
      return;
    }
    if (!selectedRestaurant) {
      toast.error("Please select restaurant");
      return;
    }

    if (!selectedRestaurant) {
      toast.error("Restaurant data is required");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Please select items to create order");
      return;
    }

    if (!tableId) {
      toast.error("Please select table");
      return;
    }

    let userrole = user.role;
    let username = `${user.fname} ${user.lname}`;
    if (user.role === Roles.OWNER || user.role === Roles.MANAGER) {
      if (userRole && selectedUser) {
        const selectedUserDetails = users.find(
          (user) => user.uniqueId === selectedUser
        );
        userrole = selectedUserDetails?.role || "";
        username = `${selectedUserDetails?.fname} ${selectedUserDetails?.lname}`;
      }
    }

    const orderData = {
      restaurantId: selectedRestaurant?.uniqueId,
      tableId: values.table_id,
      products: selectedItems,
      totalPrice: subTotal,
      typeOfSale: values.type_of_sale,
      deliveryPartner: values.delivery_partner,
      discountType: discountForm.discountType,
      discountAmount: discountForm.discountAmount,
      taxAmount: totalTax,
      role: userrole,
      user: username,
    };
    try {
      actions.setSubmitting(true);
      const response = await axios.post(
        `${API_URL}/ksr/createOrder`,
        orderData
      );
      toast.success("Order created successfully");
      await printKOT({
        device,
        setError,
        restaurant: selectedRestaurant,
        order: response.data.order,
      });
      invalidateCache(API_TAGS.GET_CURRENT_SESSION);
      invalidateCache(API_TAGS.GET_RESTAURANTS);
      invalidateCache(API_TAGS.GET_KSR_ORDER_HISTORY);
      invalidateCache(API_TAGS.GET_ACTIVE_SESSIONS);
      invalidateCache(API_TAGS.GET_DAY_CLOSE);
      navigate("/");
    } catch (error) {
      const err = error as Error & { response: { data: { message: string } } };
      toast.error(err.response.data.message);
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handlePrintFinalBill = async () => {
    if (!selectedRestaurant) {
      toast.error("Please select restaurant");
      return;
    }

    if (!tableId) {
      toast.error("Please select table");
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/ksr/session/print/final-bill?tableId=${tableId}&restaurantId=${selectedRestaurant.uniqueId}`
      );
      toast.success("Bill printed successfully");
      await printSession({
        device,
        setError,
        restaurant: selectedRestaurant,
        session: response.data.session,
      });
      navigate("/");
    } catch (error) {
      const err = error as Error & { response: { data: { message: string } } };
      toast.error(err.response.data.message);
    }
  };

  const handleCancelKOT = async () => {
    if (!selectedRestaurant) {
      toast.error("Please select restaurant");
      return;
    }

    if (!tableId) {
      toast.error("Please select table");
      return;
    }

    setCancellingKOT(true);

    try {
      const response = await axios.delete(
        `${API_URL}/ksr/orders?tableId=${tableId}`
      );
      toast.success("KOT cancelled successfully");
      refreshSessionData(API_TAGS.GET_CURRENT_SESSION, {}, true);
      invalidateCache(API_TAGS.GET_KSR_ORDER_HISTORY);
      invalidateCache(API_TAGS.GET_ACTIVE_SESSIONS);
      invalidateCache(API_TAGS.GET_DAY_CLOSE);
    } catch (error) {
      const err = error as Error & { response: { data: { message: string } } };
      toast.error(err.response.data.message);
    } finally {
      setCancellingKOT(false);
    }
  };

  const handleSettleBill = async () => {
    if (!selectedRestaurant) {
      toast.error("Please select restaurant");
      return;
    }

    if (!tableId) {
      toast.error("Please select table");
      return;
    }
    setSettlingBill(true);
    try {
      const response = await axios.post(
        `${API_URL}/ksr/session/complete?tableId=${tableId}`
      );
      invalidateCache(API_TAGS.GET_CURRENT_SESSION);
      invalidateCache(API_TAGS.GET_RESTAURANTS);
      invalidateCache(API_TAGS.GET_KSR_ORDER_HISTORY);
      invalidateCache(API_TAGS.GET_ACTIVE_SESSIONS);
      invalidateCache(API_TAGS.GET_DAY_CLOSE);
      navigate("/");
      // navigate(`/ksr/sessions/${response.data.data.uniqueId}/payments`);
    } catch (error) {
      const err = error as Error & { response: { data: { message: string } } };
      toast.error(err.response.data.message);
    } finally {
      setSettlingBill(false);
    }
  };

  const handleDeleteProductItem = async (
    uniqueId: string,
    sessionId: string
  ) => {
    if (!selectedRestaurant) {
      toast.error("Please select restaurant");
      return;
    }

    if (!uniqueId) {
      toast.error("Product unique id is required");
      return;
    }

    if (!sessionId) {
      toast.error("Session id is required");
      return;
    }

    try {
      setDeletingProductItem(true);
      const response = await axios.delete(
        `${API_URL}/ksr/order/products?uniqueId=${uniqueId}&restaurantId=${selectedRestaurant?.uniqueId}&sessionId=${sessionId}`
      );
      toast.success("Item deleted successfully");
      refreshSessionData(API_TAGS.GET_CURRENT_SESSION, {}, true);
      invalidateCache(API_TAGS.GET_KSR_ORDER_HISTORY);
      invalidateCache(API_TAGS.GET_ACTIVE_SESSIONS);
      invalidateCache(API_TAGS.GET_DAY_CLOSE);
    } catch (error) {
      const err = error as Error & { response: { data: { message: string } } };
      toast.error(err.response.data.message);
    } finally {
      setDeletingProductItem(false);
    }
  };

  const calculateDiscountAmount = (
    discountType: string,
    discountAmount: string,
    totalPrice: number,
    taxAmount: number
  ): number => {
    const parsedDiscountAmount = parseFloat(discountAmount);
    const parsedTaxAmount = taxAmount;

    if (isNaN(parsedDiscountAmount) || parsedDiscountAmount < 0) {
      return 0;
    }

    if (discountType === "percentage") {
      const validTaxAmount = isNaN(parsedTaxAmount) ? 0 : parsedTaxAmount;
      return parseFloat(
        ((totalPrice + validTaxAmount) * (parsedDiscountAmount / 100)).toFixed(
          2
        )
      );
    } else {
      return parseFloat(parsedDiscountAmount.toFixed(2));
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api(`/users/role?role=${userRole}`, {}, "get");
        setUsers(response.data);
      } catch (error) {
        const err = error as Error & {
          response: { data: { message: string } };
        };
        toast.error(err.response.data.message);
      }
    };
    if (userRole) fetchUsers();
  }, [userRole]);

  useEffect(() => {
    const discountAmount = calculateDiscountAmount(
      discountForm.discountType,
      discountForm.discountAmount,
      subTotal,
      totalTax
    );
    setDiscountAmount(discountAmount);
  }, [discountForm, subTotal, totalTax]);

  useEffect(() => {
    if (selectedRestaurant) {
      getDishData(
        `${API_URL}/ksr/inventory?restaurantId=${selectedRestaurant.uniqueId}`,
        API_TAGS.GET_KSR_INVENTORY
      );
      getSessionData(
        `${API_URL}/ksr/session?restaurantId=${selectedRestaurant.uniqueId}&tableId=${tableId}&status=active`,
        API_TAGS.GET_CURRENT_SESSION
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant, tableId]);

  useEffect(() => {
    if (selectedRestaurant) {
      setInitialValue((prev) => {
        return {
          ...prev,
          restaurantId: selectedRestaurant?.uniqueId,
        };
      });
    }
    if (tableId) {
      setInitialValue((prev) => {
        return {
          ...prev,
          table_id: tableId,
        };
      });
    }
    if (typeOfSale) {
      setInitialValue((prev) => {
        return {
          ...prev,
          type_of_sale: typeOfSale,
        };
      });
    }
  }, [tableId, typeOfSale, selectedRestaurant]);

  useEffect(() => {
    if (dishData) {
      setItems(dishData);
      setFilteredItems(dishData);
    }
  }, [dishData]);

  useEffect(() => {
    if (query === "") {
      setFilteredItems(items);
    } else {
      const debouncedFilter = debounce(() => {
        const filteredItems = items.filter((item) =>
          item.productName.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredItems(filteredItems);
      }, 300);
      debouncedFilter();
    }
  }, [query]);

  useEffect(() => {
    if (!(navigator as unknown as UsbNavigator).usb) {
      setError("WebUSB is not supported in this browser");
    }
  }, []);

  return (
    <FlexContainer variant="column-start" gap="xl" className={"h-full"}>
      <FlexContainer
        variant="row-between"
        className="p-3 rounded-xl bg-white border"
      >
        <FlexContainer variant="row-start" gap="lg" className={"items-center"}>
          <button
            onClick={() => {
              navigate("/");
            }}
            className="p-2.5 bg-white hover:border-zinc-300 rounded-lg border duration-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <FlexContainer variant="column-start" gap="none">
            <FlexContainer gap="none" className={"items-center"}>
              <span className="text-sm">{"KSR"} </span>
              <span className="text-sm">{` / ${"Order"}`}</span>
            </FlexContainer>
            <h3 className="-mt-1.5 text-lg font-semibold">{"Create Order"}</h3>
          </FlexContainer>
        </FlexContainer>
        <FlexContainer variant="row-end" gap="lg" className={"items-center"}>
          <Link to={"/ksr/sessions/active"}>
            <Button variant="outline">{"Active Orders"}</Button>
          </Link>
          <Link to={"/ksr/sessions/all"}>
            <Button variant="default" color="primary">
              {"View History"}
            </Button>
          </Link>
        </FlexContainer>
      </FlexContainer>
      <div className={"grid grid-cols-5 gap-5 items-stretch"}>
        <FlexContainer
          variant="column-start"
          className={
            "col-span-3 lg:col-span-2 flex-1 p-5 bg-white border rounded-xl max-h-[calc(100vh_-_215px)] overflow-y-auto"
          }
        >
          <Input
            type="text"
            name="search"
            labelPlacement="outside"
            label="Search your inventory"
            radius="sm"
            classNames={{
              label: "font-medium text-zinc-800",
              inputWrapper: "border shadow-none",
            }}
            placeholder="Search items"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />

          {/* skeleton loader  */}
          {dishLoading && (
            <FlexContainer variant="column-start" gap="md">
              <div className="animate-pulse flex flex-col gap-3">
                <div className="flex justify-between">
                  <div className="w-1/4 h-4 bg-gray-200 rounded-md"></div>
                  <div className="w-1/4 h-4 bg-gray-200 rounded-md"></div>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-md"></div>
              </div>
              <div className="animate-pulse flex flex-col gap-3">
                <div className="flex justify-between">
                  <div className="w-1/4 h-4 bg-gray-200 rounded-md"></div>
                  <div className="w-1/4 h-4 bg-gray-200 rounded-md"></div>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-md"></div>
              </div>

              <div className="animate-pulse flex flex-col gap-3">
                <div className="flex justify-between">
                  <div className="w-1/4 h-4 bg-gray-200 rounded-md"></div>
                  <div className="w-1/4 h-4 bg-gray-200 rounded-md"></div>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-md"></div>
              </div>
            </FlexContainer>
          )}
          {!dishLoading && filteredItems && (
            <FlexContainer variant="column-start">
              <Table
                aria-label="ksr_inventory_list"
                shadow="none"
                isStriped
                classNames={{
                  wrapper: "border",
                }}
              >
                <TableHeader>
                  <TableColumn className="flex-1 w-full">
                    Product Name
                  </TableColumn>
                  <TableColumn>Price</TableColumn>
                  <TableColumn className="text-right">Action</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((dish, _) => (
                    <TableRow key={_}>
                      <TableCell className="w-full">
                        {dish.productName}
                      </TableCell>
                      <TableCell>₹{dish.price}</TableCell>
                      <TableCell>
                        <ActionButtons
                          dish={dish}
                          selectedItems={selectedItems}
                          handleAddItem={handleAddItem}
                          handleQuantityChange={handleQuantityChange}
                          handleRemoveItems={handleRemoveItems}
                        />
                        {/* <FlexContainer
                          variant="row-end"
                          alignItems="center"
                          gap="sm"
                        >
                          <Button
                            size={"icon"}
                            variant="secondary"
                            className="hover:bg-zinc-200 active:scale-90 active:bg-zinc-800 active:text-white duration-300"
                            onClick={() => handleRemoveItems(dish)}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </Button>

                          <Popover>
                            <PopoverTrigger className="bg-zinc-900 p-2 text-white rounded-xl">
                              {" "}
                              {selectedItems.find(
                                (selectedItem) =>
                                  selectedItem?.uniqueId === dish?.uniqueId
                              )?.quantity || 0}
                            </PopoverTrigger>
                            <PopoverContent>
                              <input
                                type="number"
                                placeholder="0"
                                value={
                                  selectedItems.find(
                                    (selectedItem) =>
                                      selectedItem?.uniqueId === dish?.uniqueId
                                  )?.quantity || 0
                                }
                                onChange={(e) => handleQuantityChange(e, dish)}
                                className="w-12 py-2 rounded-md text-center reset-input"
                              />
                            </PopoverContent>
                          </Popover>
                          <span className="text-sm relative"></span>
                          <Button
                            size={"icon"}
                            variant="secondary"
                            className="hover:bg-zinc-200 active:scale-90 active:bg-zinc-800 active:text-white duration-300"
                            onClick={() => handleAddItem(dish)}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </FlexContainer> */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </FlexContainer>
          )}
        </FlexContainer>

        <FlexContainer
          variant="column-start"
          className="col-span-2 lg:col-span-3 max-h-[calc(100vh_-_215px)] overflow-y-auto"
        >
          <Formik
            initialValues={initialValue}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, handleChange, setFieldValue, isSubmitting }) => (
              <Form>
                <div className="grid lg:grid-cols-2 h-full min-h-full gap-5 w-full">
                  <div className="p-5 bg-white border rounded-xl">
                    <FlexContainer
                      variant="column-start"
                      gap="md"
                      className="grid grid-cols-2 gap-3 justify-start place-items-start"
                    >
                      <h3 className="col-span-2 text-lg font-semibold">
                        Order Details
                      </h3>
                      <Select
                        name="type_of_sale"
                        label="Type of Sale"
                        labelPlacement="outside"
                        placeholder="Select Type of Sale"
                        radius="sm"
                        size="sm"
                        items={[
                          {
                            label: "Dine In",
                            key: "dine-in",
                          },
                          {
                            label: "Takeaway",
                            key: "take-away",
                          },
                          {
                            label: "Delivery",
                            key: "delivery",
                          },
                        ]}
                        classNames={{
                          label: "text-zinc-900",
                          trigger: "border shadow-none",
                        }}
                        onChange={(e) => {
                          setSelectedItems([]);
                          setFieldValue("type_of_sale", e.target.value);
                          setFieldValue("delivery_partner", "");
                        }}
                        selectedKeys={
                          sessionData?.typeOfSale
                            ? [sessionData?.typeOfSale]
                            : [values?.type_of_sale]
                        }
                        isDisabled={sessionData?.sessionId ? true : false}
                      >
                        {(item) => (
                          <SelectItem key={item.key} value={item.key}>
                            {item.label}
                          </SelectItem>
                        )}
                      </Select>
                      <Select
                        name="table_id"
                        label="Select Table No"
                        labelPlacement="outside"
                        placeholder="Select Table No"
                        radius="sm"
                        size="sm"
                        classNames={{
                          label: "text-zinc-900",
                          trigger: "border shadow-none",
                        }}
                        items={selectedTables || []}
                        selectedKeys={values.table_id ? [values.table_id] : []}
                        onChange={(e) => {
                          setFieldValue("table_id", e.target.value);
                          setSearchParams({ tableId: e.target.value });
                        }}
                        isDisabled={sessionData?.sessionId ? true : false}
                      >
                        {(item) => (
                          <SelectItem key={item?.uniqueId}>
                            {`Table ${item?.tableNumber}`}
                          </SelectItem>
                        )}
                      </Select>
                      {values.type_of_sale === "delivery" && (
                        //select delivery partner
                        <Select
                          name="delivery_partner"
                          label="Select Delivery Partner"
                          labelPlacement="outside"
                          placeholder="Select Delivery Partner"
                          radius="sm"
                          size="sm"
                          classNames={{
                            label: "font-medium text-zinc-900",
                            trigger: "border shadow-none",
                          }}
                          items={[
                            {
                              label: "Zomato",
                              key: "zomato",
                            },
                            {
                              label: "Swiggy",
                              key: "swiggy",
                            },
                            {
                              label: "Uber Eats",
                              key: "uber_eats",
                            },
                            {
                              label: "Dunzo",
                              key: "dunzo",
                            },
                          ]}
                          onChange={handleChange}
                        >
                          {(item) => (
                            <SelectItem key={item.key} value={item.key}>
                              {item.label}
                            </SelectItem>
                          )}
                        </Select>
                      )}
                      {(user?.role === Roles.OWNER ||
                        user?.role === Roles.MANAGER) && (
                        <Fragment>
                          <Select
                            label="Select Role"
                            labelPlacement="outside"
                            placeholder="Select Role"
                            radius="sm"
                            size="sm"
                            classNames={{
                              label: "font-medium text-zinc-900",
                              trigger: "border shadow-none",
                            }}
                            items={
                              Object.values(Roles).map((role) => ({
                                key: role,
                                label: role,
                              })) || []
                            }
                            // onChange={handleChange}
                            selectedKeys={userRole ? [userRole] : []}
                            onChange={(e) => {
                              setUserRole(e.target.value);
                            }}
                          >
                            {(item) => (
                              <SelectItem key={item?.key} value={item?.key}>
                                {item?.label}
                              </SelectItem>
                            )}
                          </Select>
                          <Select
                            label="Select User"
                            labelPlacement="outside"
                            placeholder="Select User"
                            radius="sm"
                            size="sm"
                            classNames={{
                              label: "font-medium text-zinc-900",
                              trigger: "border shadow-none",
                            }}
                            items={users ? users : []}
                            // onChange={handleChange}
                            selectedKeys={selectedUser ? [selectedUser] : []}
                            onChange={(e) => {
                              setSelectedUser(e.target.value);
                            }}
                          >
                            {(item) => (
                              <SelectItem
                                key={item?.uniqueId}
                                value={item?.uniqueId}
                              >
                                {item?.fname}
                              </SelectItem>
                            )}
                          </Select>
                        </Fragment>
                      )}

                      {/* <Select
                        label="Select Tax Slab"
                        labelPlacement="outside"
                        name={`taxesListUniqueid`}
                        placeholder="Select Discount Type"
                        radius="sm"
                        size="sm"
                        classNames={{
                          label: "font-medium text-zinc-900",
                          trigger: "border shadow-none",
                        }}
                        items={taxItemsData?.taxItems || []}
                        selectedKeys={
                          taxesListUniqueid ? [taxesListUniqueid] : []
                        }
                        isLoading={taxItemsLoading}
                        onChange={(e) => {
                          setTaxesListUniqueid(e.target.value);
                          setSelectedTax(
                            taxItemsData?.taxItems.find(
                              (tax) => tax.uniqueId === e.target.value
                            ) || null
                          );
                        }}
                      >
                        {(taxSlab) => (
                          <SelectItem key={taxSlab?.uniqueId}>
                            {taxSlab?.name}
                          </SelectItem>
                        )}
                      </Select> */}

                      <div className="col-span-2 p-1.5 grid grid-cols-2 gap-1 bg-zinc-200 rounded-xl">
                        <span className="col-span-2 text-xs font-semibold text-zinc-900">
                          Apply Discount to Order:
                        </span>
                        <Input
                          type="number"
                          min={0}
                          name="discountAmount"
                          // labelPlacement="outside"
                          label={`Amt ${
                            discountForm.discountType === "percentage"
                              ? "(in %)"
                              : "(in Amt)"
                          }`}
                          radius="sm"
                          size="sm"
                          classNames={{
                            label: "font-medium text-zinc-800",
                            inputWrapper: "border shadow-none bg-white",
                          }}
                          placeholder="Enter Discount Amount"
                          value={discountForm.discountAmount}
                          onChange={(e) => {
                            setDiscountForm({
                              ...discountForm,
                              discountAmount: e.target.value,
                            });
                          }}
                        />
                        <Select
                          label="Type"
                          // labelPlacement="outside"
                          name={`discountType`}
                          placeholder="Select Discount Type"
                          radius="sm"
                          size="sm"
                          classNames={{
                            label: "font-medium text-zinc-900",
                            trigger: "border shadow-none bg-white",
                          }}
                          items={[
                            { uniqueId: "percentage", name: "Percentage" },
                            { uniqueId: "flat", name: "Flat" },
                          ]}
                          selectedKeys={
                            discountForm.discountType
                              ? [discountForm.discountType]
                              : []
                          }
                          onChange={(e) => {
                            setDiscountForm({
                              ...discountForm,
                              discountType: e.target.value,
                            });
                          }}
                        >
                          {(discount) => (
                            <SelectItem key={discount?.uniqueId}>
                              {discount?.name}
                            </SelectItem>
                          )}
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <FlexContainer
                          variant="column-start"
                          gap="sm"
                          className="p-3 bg-rose-50 rounded-md"
                        >
                          <h5 className="text-sm font-semibold text-rose-600">
                            Previous Items
                          </h5>
                          {/* skeleton loading */}

                          {!sessionData?.orders?.length && !sessionLoading && (
                            <p className="text-sm">No previous items</p>
                          )}
                          {sessionData?.orders?.length
                            ? sessionData?.orders?.map((order) =>
                                order.products.map((product, i) => (
                                  <FlexContainer variant="row-between" key={i}>
                                    <p className="text-sm">
                                      {product.productName}
                                    </p>
                                    <FlexContainer alignItems="center">
                                      <p className="text-sm">
                                        {product.quantity} x ₹{product.price}
                                      </p>
                                      <Button
                                        type="button"
                                        size={"icon"}
                                        className="bg-white rounded-xl"
                                        onClick={() =>
                                          handleDeleteProductItem(
                                            product.uniqueId,
                                            sessionData?.sessionId as string
                                          )
                                        }
                                        disabled={deletingProductItem}
                                      >
                                        {deletingProductItem ? (
                                          <Loader className="w-4 h-4 animate-spin text-red-500" />
                                        ) : (
                                          <Trash className="w-3.5 h-3.5 text-red-500" />
                                        )}
                                      </Button>
                                    </FlexContainer>
                                  </FlexContainer>
                                ))
                              )
                            : null}
                          {sessionData?.orders?.length ? (
                            <Fragment>
                              <hr className="w-full h-0.5 bg-rose-200" />
                              <FlexContainer variant="row-between">
                                <p className="text-sm">Total:</p>
                                <p className="text-sm">
                                  ₹{sessionData?.billAmount}
                                </p>
                              </FlexContainer>
                            </Fragment>
                          ) : null}
                          {sessionLoading && (
                            <FlexContainer variant="column-start" gap="md">
                              <div className="animate-pulse flex flex-col gap-3">
                                <div className="flex justify-between">
                                  <div className="w-1/4 h-4 bg-rose-200 rounded-md"></div>
                                  <div className="w-1/4 h-4 bg-rose-200 rounded-md"></div>
                                </div>
                                <div className="w-full h-4 bg-rose-200 rounded-md"></div>
                              </div>
                              <div className="animate-pulse flex flex-col gap-3">
                                <div className="flex justify-between">
                                  <div className="w-1/4 h-4 bg-rose-200 rounded-md"></div>
                                  <div className="w-1/4 h-4 bg-rose-200 rounded-md"></div>
                                </div>
                                <div className="w-full h-4 bg-rose-200 rounded-md"></div>
                              </div>
                            </FlexContainer>
                          )}
                        </FlexContainer>
                      </div>
                    </FlexContainer>
                  </div>
                  <FlexContainer
                    variant="column-start"
                    gap="md"
                    className="max-h-[calc(100vh_-_215px)] overflow-y-auto p-3 bg-white border rounded-xl grid grid-cols-2 gap-3"
                  >
                    <FlexContainer
                      variant="column-start"
                      className="col-span-2"
                      gap="md"
                    >
                      <h3 className={cn("text-lg font-semibold p-3 pb-0")}>
                        Order Summary
                      </h3>
                      <FlexContainer variant="column-start" className="w-full">
                        {selectedItems.length > 0 && (
                          <FlexContainer
                            variant="column-start"
                            gap="sm"
                            className="p-3 bg-blue-50 rounded-md"
                          >
                            <h5 className="text-sm font-semibold text-blue-600">
                              Current Items
                            </h5>
                            {selectedItems?.map((item, index) => (
                              <FlexContainer variant="row-between" key={index}>
                                <p className="text-sm">{item?.productName}</p>
                                <p className="text-sm">
                                  {item?.quantity} x ₹{item?.price}
                                </p>
                              </FlexContainer>
                            ))}
                          </FlexContainer>
                        )}
                      </FlexContainer>
                      <FlexContainer
                        variant="column-start"
                        className="w-full px-3"
                        gap="md"
                      >
                        <FlexContainer variant="row-between">
                          <p className="text-sm">Subtotal:</p>
                          <p className="text-sm">₹{subTotal}</p>
                        </FlexContainer>
                        <hr />
                        <FlexContainer variant="row-between">
                          <p className="text-sm">Tax</p>
                          <p className="text-sm">
                            {totalTax ? `₹${totalTax}` : null}
                          </p>
                        </FlexContainer>
                        <FlexContainer variant="row-between">
                          <p className="text-sm">Total</p>
                          <p className="text-sm">{`₹${subTotal + totalTax}`}</p>
                        </FlexContainer>
                        <hr />
                        <FlexContainer variant="row-between">
                          {/* gst */}
                          <p className="text-sm">Discount</p>
                          <p className="text-sm">{"- " + discountAmount}</p>
                        </FlexContainer>
                        <FlexContainer
                          variant="column-start"
                          gap="sm"
                          className="bg-zinc-200 rounded-xl p-1.5"
                        >
                          <p className="text-xs font-semibold">
                            Apply Discount to Session:
                          </p>
                          <div className="grid grid-cols-3 gap-1.5 items-stretch">
                            <Input
                              type="text"
                              name="discount"
                              // labelPlacement="outside"
                              label="Discount"
                              radius="sm"
                              size="sm"
                              classNames={{
                                label: "font-medium text-zinc-800",
                                inputWrapper: "border shadow-none bg-white",
                              }}
                              placeholder="Enter Discount"
                              value={extraDiscount.discount}
                              onChange={(e) => {
                                setExtraDiscount({
                                  ...extraDiscount,
                                  discount: e.target.value,
                                });
                              }}
                            />
                            <Select
                              name="discountType"
                              label="Type"
                              // labelPlacement="outside"
                              placeholder="Select Discount Type"
                              radius="sm"
                              size="sm"
                              classNames={{
                                label: "font-medium text-zinc-900",
                                trigger: "border shadow-none bg-white",
                                popoverContent: "w-36",
                              }}
                              items={[
                                { uniqueId: "percentage", name: "Percentage" },
                                { uniqueId: "flat", name: "Flat" },
                              ]}
                              selectedKeys={
                                extraDiscount.discountType
                                  ? [extraDiscount.discountType]
                                  : []
                              }
                              onChange={(e) => {
                                setExtraDiscount({
                                  ...extraDiscount,
                                  discountType: e.target.value,
                                });
                              }}
                            >
                              {(discount) => (
                                <SelectItem key={discount?.uniqueId}>
                                  {discount?.name}
                                </SelectItem>
                              )}
                            </Select>
                            <div className="grid grid-cols-2 gap-1">
                              {" "}
                              <Button
                                type="button"
                                variant="secondary"
                                className="bg-green-500 text-white hover:bg-green-600 h-auto"
                                onClick={async () => {
                                  if (!selectedRestaurant) {
                                    toast.error("Please select restaurant");
                                    return;
                                  }

                                  if (!tableId) {
                                    toast.error("Please select table");
                                    return;
                                  }

                                  try {
                                    const discountAmount =
                                      calculateDiscountAmount(
                                        extraDiscount.discountType,
                                        extraDiscount.discount,
                                        (sessionData?.billAmount || 0) +
                                          (sessionData?.discountAmount || 0),
                                        0
                                      );
                                    console.log(
                                      discountAmount,
                                      "discountAmount"
                                    );
                                    const response = await axios.post(
                                      `${API_URL}/ksr/session/discount`,
                                      {
                                        tableId: tableId,
                                        restaurantId:
                                          selectedRestaurant?.uniqueId,
                                        discount: parseFloat(
                                          extraDiscount.discount || "0"
                                        ),
                                        discountType:
                                          extraDiscount.discountType,
                                        discountAmount,
                                      }
                                    );
                                    setExtraDiscount({
                                      discount: "0",
                                      discountType: "flat",
                                      discountAmount: "0",
                                    });
                                    toast.success(
                                      "Discount applied successfully"
                                    );
                                    refreshSessionData(
                                      API_TAGS.GET_CURRENT_SESSION,
                                      {},
                                      true
                                    );
                                  } catch (error) {
                                    const err = error as Error & {
                                      response: { data: { message: string } };
                                    };
                                    toast.error(err.response.data.message);
                                  }
                                }}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                className="h-auto"
                                onClick={() => {
                                  setExtraDiscount({
                                    discount: "0",
                                    discountType: "flat",
                                    discountAmount: "0",
                                  });
                                }}
                              >
                                <XIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </FlexContainer>
                        <hr />
                      </FlexContainer>
                      {
                        //total price
                        <FlexContainer variant="row-between" className="px-3">
                          <p className="text-base font-medium">
                            Total Payable:{" "}
                          </p>
                          <p className="text-base font-medium">
                            {(subTotal + totalTax - discountAmount).toFixed(2)}
                          </p>
                        </FlexContainer>
                      }
                      <div className="px-3 pb-3 grid grid-cols-2 gap-3">
                        <Button
                          variant="default"
                          type="submit"
                          isLoading={isSubmitting}
                        >
                          Print KOT
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleCancelKOT}
                          isLoading={cancellingKOT}
                        >
                          Cancel KOT
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="bg-amber-400 text-white hover:bg-amber-500"
                          onClick={handlePrintFinalBill}
                        >
                          Print Final Bill
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="bg-green-500 text-white hover:bg-green-600"
                          onClick={onOpen}
                        >
                          Settle Bill
                        </Button>
                      </div>
                    </FlexContainer>
                  </FlexContainer>
                </div>
              </Form>
            )}
          </Formik>
        </FlexContainer>
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
        <ModalContent>
          {(onClose) => {
            return (
              <Fragment>
                <ModalHeader className="flex flex-col gap-1">
                  <h4 className="text-lg font-semibold">Settle Bill</h4>
                </ModalHeader>
                <ModalBody>
                  <Payments
                    tableId={tableId as string}
                    session={sessionData}
                    refreshSession={refreshSessionData}
                    sessionLoading={sessionLoading}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button variant={"ghost"} onClick={onClose}>
                    Close
                  </Button>
                  <Button
                    className="bg-green-500 text-white hover:bg-green-600"
                    onClick={handleSettleBill}
                    isLoading={settlingBill}
                  >
                    Verify and Settle
                  </Button>
                </ModalFooter>
              </Fragment>
            );
          }}
        </ModalContent>
      </Modal>
    </FlexContainer>
  );
};

interface PaymentForm {
  paymentType: string;
  amount: number;
}

const Payments = ({
  tableId,
  session,
  refreshSession,
  sessionLoading,
}: {
  tableId: string;
  session: KsrSession | null;
  refreshSession: (X: string, Y: object, Z: boolean) => void;
  sessionLoading: boolean;
}) => {
  const [addingPayemnt, setAddingPayment] = useState(false);
  const [form, setForm] = useState<PaymentForm>({
    paymentType: "",
    amount: 0,
  });

  const { data, error, loading, getData, refresh } = useGet<KsrPayment[]>({
    showToast: false,
  });

  //if it is less than 0 then it should be zero
  const billDue =
    (session?.billAmount || 0) - (session?.totalPaid || 0) < 0
      ? 0
      : (session?.billAmount || 0) - (session?.totalPaid || 0);

  const handleAddPayment = async () => {
    if (!form.paymentType) {
      toast.error("Payment Type is required");
      return;
    }

    if (form.amount <= 0) {
      toast.error("Amount should be greater than 0");
      return;
    }
    if (!tableId) {
      toast.error("Table Id is required");
      return;
    }

    try {
      setAddingPayment(true);
      const response = await axios.post(`${API_URL}/ksr/session/payment`, {
        tableId: tableId,
        method: form.paymentType,
        amount: form.amount,
      });
      // refresh(API_TAGS.GET_KSR_PAYMENT, {}, true);
      refreshSession(API_TAGS.GET_CURRENT_SESSION, {}, true);
      setForm({
        paymentType: "",
        amount: 0,
      });
    } catch (error) {
      const err = error as Error & { response: { data: { message: string } } };
      toast.error(err.response.data.message);
    } finally {
      setAddingPayment(false);
    }
  };

  useEffect(() => {
    getData(
      `${API_URL}/ksr/session/payment?tableId=${tableId}`,
      API_TAGS.GET_KSR_PAYMENT
    );
  }, [tableId]);

  useEffect(() => {
    if (data?.length) {
      const freshPayments = data?.map((payment) => {
        return {
          paymentType: payment.paymentMethod,
          amount: payment.amount,
        };
      });
    }
  }, [data]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="grid gap-3">
        {!sessionLoading ? (
          <div className="grid gap-3">
            <FlexContainer
              variant="row-between"
              className="p-3 bg-white border rounded-md"
            >
              <h5 className="text-sm font-semibold">Bill Amount</h5>
              <p className="text-sm">₹{Math.ceil(session?.billAmount || 0)}</p>
            </FlexContainer>
            <FlexContainer
              variant="column-start"
              className="p-3 bg-white border rounded-md"
            >
              <h5 className="text-sm font-semibold">Previous Payments</h5>
              {data?.map((payment, i) => (
                <FlexContainer variant="row-between" key={i}>
                  <p className="text-sm">{payment.paymentMethod}</p>
                  <p className="text-sm">₹{payment.amount}</p>
                </FlexContainer>
              ))}
              <hr />
              <FlexContainer variant="row-between">
                <p className="text-sm">Total Paid</p>
                <p className="text-sm">₹{session?.totalPaid}</p>
              </FlexContainer>
              <FlexContainer variant="row-between">
                <p className="text-sm">Total Due</p>
                <p className="text-sm">₹{billDue}</p>
              </FlexContainer>
            </FlexContainer>
          </div>
        ) : null}
        {/* skeleton */}
        {sessionLoading && (
          <FlexContainer variant="column-start" gap="md">
            <div className="animate-pulse flex flex-col gap-3">
              <div className="flex justify-between">
                <div className="w-1/4 h-4 bg-zinc-200 rounded-md"></div>
                <div className="w-1/4 h-4 bg-zinc-200 rounded-md"></div>
              </div>
              <div className="w-full h-4 bg-zinc-200 rounded-md"></div>
            </div>
            <div className="animate-pulse flex flex-col gap-3">
              <div className="flex justify-between">
                <div className="w-1/4 h-4 bg-zinc-200 rounded-md"></div>
                <div className="w-1/4 h-4 bg-zinc-200 rounded-md"></div>
              </div>
              <div className="w-full h-4 bg-zinc-200 rounded-md"></div>
            </div>
          </FlexContainer>
        )}
      </div>
      <div className="p-3 bg-white border rounded-md">
        <h5 className="text-sm font-semibold">Add new Payments</h5>
        <div className="grid grid-cols-2 gap-3">
          <Select
            name="paymentType"
            label="Payment Type"
            labelPlacement="outside"
            placeholder="Select Payment Type"
            radius="sm"
            size="sm"
            items={[
              {
                label: "Cash",
                key: "cash",
              },
              {
                label: "Card",
                key: "card",
              },
              {
                label: "UPI",
                key: "upi",
              },
              //zomotao
              {
                label: "Zomato",
                key: "zomato",
              },
              //swiggy
              {
                label: "Swiggy",
                key: "swiggy",
              },
              //uber eats
              {
                label: "Uber Eats",
                key: "uber_eats",
              },
              //dunzo
              {
                label: "Dunzo",
                key: "dunzo",
              },
            ]}
            classNames={{
              label: "text-zinc-900",
              trigger: "border shadow-none",
            }}
            onChange={(e) => {
              setForm({
                ...form,
                paymentType: e.target.value,
              });
            }}
            selectedKeys={form.paymentType ? [form.paymentType] : []}
          >
            {(item) => (
              <SelectItem key={item.key} value={item.key}>
                {item.label}
              </SelectItem>
            )}
          </Select>
          <Input
            type="number"
            label="Amount"
            labelPlacement="outside"
            placeholder="Enter Amount"
            radius="sm"
            size="sm"
            classNames={{
              label: "text-zinc-900",
              inputWrapper: "border shadow-none",
            }}
            value={form.amount.toString()}
            onChange={(e) => {
              setForm({
                ...form,
                amount: parseFloat(e.target.value),
              });
            }}
          />
          <div className="col-span-2 grid gap-2.5">
            {/* <Button
                variant="destructive"
                onClick={() => {
                  const newForm = [...form];
                  newForm.splice(i, 1);
                  setForm(newForm);
                }}
                size={"sm"}
              >
                <Trash className="w-4 h-4" />
              </Button> */}

            <Button
              isLoading={addingPayemnt}
              variant="default"
              onClick={handleAddPayment}
              size={"sm"}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionButtons = ({
  dish,
  selectedItems,
  handleAddItem,
  handleRemoveItems,
  handleQuantityChange,
}: {
  dish: KsrCategoryItem;
  selectedItems: SelectedItem[];
  handleAddItem: (dish: KsrCategoryItem) => void;
  handleRemoveItems: (dish: KsrCategoryItem) => void;
  handleQuantityChange: (q: number, dish: KsrCategoryItem) => void;
}) => {
  const [inputValue, setInputValue] = useState<number>(
    selectedItems.find(
      (selectedItem) => selectedItem?.uniqueId === dish?.uniqueId
    )?.quantity || 0
  );

  return (
    <FlexContainer variant="row-end" alignItems="center" gap="sm">
      <Button
        size={"icon"}
        variant="secondary"
        className="hover:bg-zinc-200 active:scale-90 active:bg-zinc-800 active:text-white duration-300"
        onClick={() => handleRemoveItems(dish)}
      >
        <Minus className="w-3.5 h-3.5" />
      </Button>

      <Popover>
        <PopoverTrigger className="rounded-xl flex items-center justify-center gap-1">
          {" "}
          {selectedItems.find(
            (selectedItem) => selectedItem?.uniqueId === dish?.uniqueId
          )?.quantity || 0}{" "}
          <Pencil className="w-3 h-3" />
        </PopoverTrigger>
        <PopoverContent className="w-32 p-1 flex flex-wrap gap-1.5">
          <input
            type="number"
            placeholder="0"
            className="flex-1 py-2 w-full rounded-md text-center reset-input"
            value={inputValue}
            onChange={(e) => {
              if (isNaN(parseInt(e.target.value))) {
                setInputValue(0);
              } else {
                setInputValue(parseInt(e.target.value));
              }
            }}
          />
          <Button
            size={"icon"}
            className="bg-green-500"
            onClick={() => handleQuantityChange(inputValue, dish)}
          >
            <Check className="w-3.5 h-3.5" />
          </Button>
        </PopoverContent>
      </Popover>
      <Button
        size={"icon"}
        variant="secondary"
        className="hover:bg-zinc-200 active:scale-90 active:bg-zinc-800 active:text-white duration-300"
        onClick={() => handleAddItem(dish)}
      >
        <Plus className="w-3.5 h-3.5" />
      </Button>
    </FlexContainer>
  );
};

export default CreateOrder;
