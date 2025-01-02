import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Tab } from "@/components/layout/Tab";
import { Button } from "@/components/ui/button";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { cn } from "@/lib/utils";
import { useGlobalContext } from "@/store/GlobalContext";
import {
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import axios from "axios";
import { Form, Formik } from "formik";
import { Loader2, Trash } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { KsrCategoryItem } from "../types";
import { Tax } from "./types";

interface FormValues {
  name: string;
  CGST: string;
  SGST: string;
  CESS: string;
  SERVICE: string;
}

const TaxConfig = () => {
  const { selectedRestaurant } = useGlobalContext();

  const [activeTab, setActiveTab] = useState(1);
  const [selectedDish, setSelectedDish] = useState<string[]>([]);

  const handleTabClick = (tab: number) => {
    setActiveTab(tab);
  };
  const [params, setParams] = useSearchParams();

  const handleDishSelect = (id: string) => {
    if (selectedDish.includes(id)) {
      setSelectedDish(selectedDish.filter((dish) => dish !== id));
    } else {
      setSelectedDish([...selectedDish, id]);
    }
  };

  const initialValues = {
    name: "",
    CGST: "",
    SGST: "",
    CESS: "",
    SERVICE: "",
  };

  const {
    data: taxItemsData,
    error: taxItemsError,
    loading: taxItemsLoading,
    getData: getTaxItemsData,
    invalidateCache,
    refresh,
  } = useGet<Tax[]>({ showToast: false });

  const {
    data: dishData,
    error: dishError,
    loading: dishLoading,
    getData: getDishData,
    refresh: refreshDishData,
  } = useGet<KsrCategoryItem[]>({ showToast: false });

  const handleSubmit = async (
    values: FormValues,
    {
      setSubmitting,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => {
    setSubmitting(true);
    console.log(values);
    const taxData = {
      restaurantId: selectedRestaurant?.uniqueId,
      products: selectedDish,
      name: values.name,
      CGST: parseFloat(values.CGST || "0"),
      SGST: parseFloat(values.SGST || "0"),
      CESS: parseFloat(values.CESS || "0"),
      SERVICE: parseFloat(values.SERVICE || "0"),
    };
    try {
      const res = await axios.post(`${API_URL}/createTaxItem`, taxData);
      const { data } = await res.data;
      toast.success("Tax added successfully");
      setSelectedDish([]);
      refresh(API_TAGS.GET_TAXES);
      refreshDishData(API_TAGS.GET_KSR_INVENTORY, {}, false);
      setParams({ tab: "1" });
    } catch (error) {
      const err = error as Error & { response: { data: { message: string } } };
      toast.error(err.response.data.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedRestaurant) {
      getTaxItemsData(
        `${API_URL}/taxes?restaurantId=${selectedRestaurant?.uniqueId}&includeProducts=true`,
        API_TAGS.GET_TAXES
      );
      getDishData(
        `${API_URL}/ksr/inventory?restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_KSR_INVENTORY
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);

  useEffect(() => {
    if (params.get("tab")) {
      setActiveTab(Number(params.get("tab")));
    }
  }, [params]);

  return (
    <FlexContainer variant="column-start" gap="xl">
      <ActionArea
        heading={"Config"}
        subheading={"Taxes"}
        title={"Tax Configuration"}
      />
      <FlexContainer variant="row-start" className="overflow-x-auto">
        <Tab
          title="Taxes List"
          isActiveTab={activeTab === 1}
          onClick={() => {
            // handleTabClick(1);
            setParams({ tab: "1" });
          }}
        />
        <Tab
          title="Create Tax"
          isActiveTab={activeTab === 2}
          onClick={() => {
            // handleTabClick(2);
            setParams({ tab: "2" });
          }}
        />
      </FlexContainer>
      {/* loading skeleton */}
      {taxItemsLoading && (
        <Fragment>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-20 w-full bg-gray-200 rounded-xl border animate-pulse"
              ></div>
            ))}
          </div>
        </Fragment>
      )}
      {activeTab === 1 && (
        <FlexContainer variant="column-start">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {!taxItemsLoading && taxItemsData?.length
              ? taxItemsData?.map((tax) => (
                  <TaxCard tax={tax} refresh={refresh} key={tax.uniqueId} />
                ))
              : []}
          </div>
        </FlexContainer>
      )}
      {activeTab === 2 && (
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, handleChange, isSubmitting }) => {
            return (
              <Form>
                <FlexContainer variant="column-start" gap="md">
                  <div className="grid grid-cols-3 gap-3 lg:grid-cols-5">
                    <Input
                      name="name"
                      label="Tax Name"
                      labelPlacement="outside"
                      placeholder="Enter Tax Name"
                      radius="sm"
                      classNames={{
                        label: "font-medium text-zinc-800",
                        inputWrapper: "border shadow-none",
                      }}
                      value={values.name}
                      onChange={handleChange}
                    />

                    <Input
                      type="number"
                      name="SGST"
                      label="SGST TAX (%)"
                      labelPlacement="outside"
                      placeholder="Enter SGST"
                      radius="sm"
                      classNames={{
                        label: "font-medium text-zinc-800",
                        inputWrapper: "border shadow-none",
                      }}
                      value={values.SGST}
                      onChange={handleChange}
                    />

                    <Input
                      type="number"
                      name="CGST"
                      label="CGST TAX (%)"
                      labelPlacement="outside"
                      placeholder="Enter CGST"
                      radius="sm"
                      classNames={{
                        label: "font-medium text-zinc-800",
                        inputWrapper: "border shadow-none",
                      }}
                      value={values.CGST}
                      onChange={handleChange}
                    />
                    <Input
                      type="number"
                      name="CESS"
                      label="CESS TAX (%)"
                      labelPlacement="outside"
                      placeholder="Enter CGST"
                      radius="sm"
                      classNames={{
                        label: "font-medium text-zinc-800",
                        inputWrapper: "border shadow-none",
                      }}
                      value={values.CESS}
                      onChange={handleChange}
                    />
                    <Input
                      type="number"
                      name="SERVICE"
                      label="SERVICE TAX (%)"
                      labelPlacement="outside"
                      placeholder="Enter CGST"
                      radius="sm"
                      classNames={{
                        label: "font-medium text-zinc-800",
                        inputWrapper: "border shadow-none",
                      }}
                      value={values.SERVICE}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {dishData?.map((dish) => (
                      <div
                        onClick={() => handleDishSelect(dish.uniqueId)}
                        className={cn(
                          "px-3 py-5 text-center bg-white border shadow-sm rounded-xl font-medium cursor-pointer duration-200 text-sm",
                          selectedDish.includes(dish.uniqueId)
                            ? "bg-zinc-800 text-white"
                            : "bg-white"
                        )}
                      >
                        {dish.productName}
                      </div>
                    ))}
                  </div>
                  <FlexContainer variant="row-end">
                    <Button
                      variant="default"
                      type="submit"
                      isLoading={isSubmitting}
                    >
                      Create Tax
                    </Button>
                  </FlexContainer>
                </FlexContainer>
              </Form>
            );
          }}
        </Formik>
      )}
    </FlexContainer>
  );
};

const TaxCard = ({
  tax,
  refresh,
}: {
  tax: Tax;
  refresh: (tag: string) => void;
}) => {
  const [deleting, setDeleting] = useState(false);
  const handleDeleteTax = async () => {
    setDeleting(true);
    try {
      const res = await axios.delete(
        `${API_URL}/tax?uniqueId=${tax?.uniqueId}`
      );
      toast.success(res?.data?.message || "Item deleted successfully");
      refresh(API_TAGS.GET_TAXES);
    } catch (error) {
      const errorData = error as Error & {
        response: { data: { error: string } };
      };
      toast.error(errorData.response.data.error || "An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative p-3 bg-blue-50 rounded-xl border">
      <button
        className="absolute -top-2 -right-2 p-2 rounded-xl text-xs bg-rose-500 text-red-50 shadow-lg shadow-rose-300"
        onClick={handleDeleteTax}
      >
        {deleting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash className="w-3.5 h-3.5" />
        )}
      </button>
      <div className="grid grid-cols-5 gap-3 text-left pb-2">
        <div className="text-xs font-semibold text-zinc-800">TAX NAME</div>
        <div className="text-xs font-semibold text-zinc-800">CGST</div>
        <div className="text-xs font-semibold text-zinc-800">SGST</div>
        <div className="text-xs font-semibold text-zinc-800">CESS</div>
        <div className="text-xs font-semibold text-zinc-800">SERVICE</div>
      </div>
      <div className="grid grid-cols-5 gap-3 py-2 border-t">
        <div className="text-sm text-zinc-700">{tax?.name}</div>
        <div className="text-sm text-zinc-700">{tax?.CGST}%</div>
        <div className="text-sm text-zinc-700">{tax?.SGST}%</div>
        <div className="text-sm text-zinc-700">{tax?.CESS}%</div>
        <div className="text-sm text-zinc-700">{tax?.SERVICE}%</div>
      </div>
      <div className="p-3 bg-blue-100 rounded-xl">
        <p className="text-xs font-semibold text-zinc-700">
          {tax?.products?.length} Products
        </p>
        <div className="grid grid-cols gap-3 mt-2">
          {tax?.products?.map((product) => (
            <div key={product.uniqueId} className="text-xs text-zinc-700">
              {product.productName}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaxConfig;
