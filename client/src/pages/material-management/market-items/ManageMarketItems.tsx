import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Button } from "@/components/ui/button";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { useGlobalContext } from "@/store/GlobalContext";
import {
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import axios from "axios";
import { Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MainCategory } from "../categories/types";
import { MarketItem } from "./types";

const ManageMarketItems = () => {
  const { property, selectedRestaurant } = useGlobalContext();

  const [selectedMainCategory, setSelectedMainCategory] = useState("");

  const {
    data: marketPlaceItemsData,
    error: marketPlaceItemsError,
    loading: marketPlaceItemsLoading,
    invalidateCache,
    refresh,
    getData: getMarketPlaceItemsData,
  } = useGet<MarketItem[]>({ showToast: false });

  const {
    data: mainCategoryData,
    error: mainCategoryError,
    loading: mainCategoryLoading,
    getData: getMainCategoryData,
  } = useGet<MainCategory[]>({ showToast: false });

  useEffect(() => {
    if (property?.uniqueId) {
      getMainCategoryData(
        `${API_URL}/getMainCategories?restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_MAIN_CATEGORY
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);
  useEffect(() => {
    if (selectedRestaurant?.uniqueId) {
      getMarketPlaceItemsData(
        `${API_URL}/getMarketItems?mainCategory=${selectedMainCategory}&restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_MARKETPLACE_ITEMS_BY_MAIN_CATEGORY
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMainCategory, selectedRestaurant]);
  return (
    <FlexContainer variant="column-start" gap="xl">
      <ActionArea
        heading={"Items"}
        subheading={"List"}
        title={"Manage Items"}
        showButton={true}
        buttonHref={"create"}
        buttonText={"Add Item"}
      />
      <FlexContainer variant="row-end">
        <div>
          <Select
            name="mainCategory"
            label="Main Categories"
            placeholder="Select Main Category"
            radius="sm"
            classNames={{
              label: "font-medium text-zinc-900",
              trigger: "border shadow-none w-64",
            }}
            items={mainCategoryData || []}
            isLoading={mainCategoryLoading}
            onChange={(e) => {
              setSelectedMainCategory(e.target.value);
              if (e?.target?.value?.length > 0) {
                e.target.hidePopover();
                // refresh();
              }
            }}
            selectionMode="single"
            selectedKeys={selectedMainCategory ? [selectedMainCategory] : []}
          >
            {(item) => (
              <SelectItem key={item?.uniqueId}>{item?.name}</SelectItem>
            )}
          </Select>
        </div>
      </FlexContainer>
      <Table aria-label="items list">
        <TableHeader>
          <TableColumn>S No.</TableColumn>
          <TableColumn>Product Name</TableColumn>
          <TableColumn className="rounded-r-xl">Main Category</TableColumn>
          <TableColumn className="rounded-r-xl">Sub Category</TableColumn>
          <TableColumn className="bg-white"> </TableColumn>
        </TableHeader>
        <TableBody emptyContent="No items found">
          {!marketPlaceItemsLoading && marketPlaceItemsData?.length
            ? marketPlaceItemsData?.map((item, i) => {
                return (
                  <TableRow key={item?.uniqueId}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{item?.productName}</TableCell>
                    <TableCell>{item?.mainCategoryName}</TableCell>
                    <TableCell>{item?.subCategoryName}</TableCell>
                    <TableCell>
                      <Button
                        size={"icon"}
                        onClick={async () => {
                          if (!item.uniqueId) {
                            return toast.error("Item not found");
                          }
                          try {
                            const res = await axios.delete(
                              `${API_URL}/deleteMarketItem?uniqueId=${item?.uniqueId}`
                            );
                            toast.success(
                              res?.data?.message || "Item deleted successfully"
                            );
                            refresh(API_TAGS.GET_MARKETPLACE_ITEMS);
                            refresh(
                              API_TAGS.GET_MARKETPLACE_ITEMS_BY_MAIN_CATEGORY
                            );
                          } catch (error) {
                            const err = error as Error & {
                              response: { data: { error: string } };
                            };
                            toast.error(
                              err?.response?.data?.error || "An error occurred"
                            );
                          }
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            : []}
        </TableBody>
      </Table>
    </FlexContainer>
  );
};

export default ManageMarketItems;
