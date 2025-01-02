import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Tab } from "@/components/layout/Tab";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/consts/app";
import { useGlobalContext } from "@/store/GlobalContext";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import axios from "axios";
import { Trash } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { API_TAGS } from "../../lib/consts/API_TAGS";
import useGet from "../../lib/hooks/use-get";
import { KsrMainCategory } from "./types";

const KSRInventory = () => {
  const { selectedRestaurant } = useGlobalContext();
  const [activeTab, setActiveTab] = useState(1);
  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };
  const {
    data: categoryData,
    error: categoryError,
    loading: categoryLoading,
    invalidateCache: invalidateCategoryCache,
    refresh: refreshCategoryData,
    getData: getCategoryData,
  } = useGet<KsrMainCategory[]>({ showToast: false });

  useEffect(() => {
    if (selectedRestaurant?.uniqueId) {
      getCategoryData(
        `${API_URL}/ksr/getDishMainCategories?includeItems=true&restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_DISH_MAIN_CATEGORY
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);
  return (
    <FlexContainer variant="column-start" gap="xl">
      <ActionArea
        heading="KSR"
        subheading="Inventory"
        title="Inventory Management"
        // showButton={true}
        // buttonText="Create Order"
        // buttonHref="/ksr/create-order"
        showExtraButton
        extraButtonText="Config"
        extraButtonHref="/ksr/settings"
      />

      <FlexContainer variant="row-between">
        <h2 className="font-semibold text-xl">Inventory Items</h2>
        <Link to="/ksr/reports">
          <Button variant={"outline"}>View Report</Button>
        </Link>
      </FlexContainer>

      {activeTab === 1 && (
        <FlexContainer variant="column-start">
          {/* <FlexContainer variant="row-between" gap="xl">
            
          </FlexContainer> */}
          {!categoryLoading &&
            categoryData &&
            categoryData?.map((item, index) => {
              return (
                <Fragment key={index}>
                  <FlexContainer
                    className={"items-center"}
                    variant="row-between"
                    gap="sm"
                  >
                    <h3 className="font-semibold">{item.name}</h3>
                    <FlexContainer
                      variant="row-end"
                      gap="sm"
                      className={"pr-3"}
                    >
                      <Button
                        size={"icon"}
                        onClick={async () => {
                          try {
                            const res = await axios.delete(
                              `${API_URL}/ksr/deleteDishMainCategory?uniqueId=${item?.uniqueId}`
                            );
                            toast.success("Category deleted successfully");
                            refreshCategoryData(
                              API_TAGS.GET_DISH_MAIN_CATEGORY
                            );
                          } catch (error) {
                            const err = error as Error & {
                              response: { data: { error: string } };
                            };
                            toast.error(
                              err?.response?.data?.error ||
                                "Something went wrong"
                            );
                          }
                        }}
                        variant="destructive"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </FlexContainer>
                  </FlexContainer>
                  <Table aria-label="inventory_list">
                    <TableHeader>
                      <TableColumn className="flex-1 w-full">
                        Product Name
                      </TableColumn>
                      <TableColumn>Price</TableColumn>
                      <TableColumn className="text-right">Action</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {item.categoryItems.map((dish, index) => (
                        <TableRow key={index}>
                          <TableCell className="w-full">
                            {dish.productName}
                          </TableCell>

                          <TableCell>₹{dish.price}</TableCell>
                          <TableCell>
                            <FlexContainer variant="row-end" gap="sm">
                              <Button
                                size={"icon"}
                                variant="ghost"
                                onClick={async () => {
                                  try {
                                    const res = await axios.delete(
                                      `${API_URL}/ksr/deleteDishInventory?uniqueId=${dish?.uniqueId}`
                                    );
                                    toast.success("Item deleted successfully");

                                    refreshCategoryData(
                                      API_TAGS.GET_DISH_MAIN_CATEGORY
                                    );
                                  } catch (error) {
                                    const err = error as Error & {
                                      response: { data: { error: string } };
                                    };
                                    toast.error(
                                      err?.response?.data?.error ||
                                        "Something went wrong"
                                    );
                                  }
                                }}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </FlexContainer>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Fragment>
              );
            })}
        </FlexContainer>
      )}
    </FlexContainer>
  );
};

export default KSRInventory;
