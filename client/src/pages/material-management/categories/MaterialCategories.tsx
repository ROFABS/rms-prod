import FlexContainer from "@/components/layout/FlexContainer";
import Loader from "@/components/layout/Loader";
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
import dayjs from "dayjs";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ActionArea from "../../../components/layout/ActionArea";
import { MainCategory, SubCategory } from "./types";

const MaterialCategories = () => {
  const { user, selectedRestaurant } = useGlobalContext();
  console.log(user);

  const [selectedMainCategory, setSelectedMainCategory] = useState("");

  const {
    data: mainCategoryData,
    error: mainCategoryError,
    loading: mainCategoryLoading,
    refresh,
    getData: getMainCategoryData,
  } = useGet<MainCategory[]>({ showToast: false });

  const {
    data: subCategoriesData,
    error: subCategoriesError,
    loading: subCategoriesLoading,
    getData: getSubCategoriesData,
    refresh: refreshSubCategories,
  } = useGet<SubCategory[]>({ showToast: false });

  const handleCreateMainCategories = async () => {
    if (!selectedRestaurant?.uniqueId) {
      toast.error("Property not found");
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/auto/createMainCategories`, {
        restaurantId: selectedRestaurant?.uniqueId,
      });
      toast.success(res?.data?.message || "Main Category created successfully");
      refresh(API_TAGS.GET_MAIN_CATEGORY, {}, true);
    } catch (error) {
      const err = error as Error & {
        response: { data: { error: string } };
      };
      toast.error(err?.response?.data?.error || "An error occurred");
    }
  };

  useEffect(() => {
    if (selectedRestaurant?.uniqueId) {
      getSubCategoriesData(
        `${API_URL}/getSubCategories?includeMainCategory=true&mainCategoryId=${selectedMainCategory}&restaurantId=${selectedRestaurant?.uniqueId}`,
        selectedMainCategory.length > 0
          ? API_TAGS.GET_SUB_CATEGORY_BY_MAIN_CATEGORY
          : API_TAGS.GET_SUB_CATEGORY
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMainCategory, selectedRestaurant]);

  useEffect(() => {
    if (selectedRestaurant?.uniqueId) {
      getMainCategoryData(
        `${API_URL}/getMainCategories?restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_MAIN_CATEGORY
      );
    }
  }, [selectedRestaurant]);
  return (
    <FlexContainer variant="column-start" gap="xl" className={"h-full"}>
      <ActionArea
        heading={"Categories"}
        subheading={"Material"}
        title={"Manage Material Categories"}
        showButton={true}
        buttonText={"Create Sub Category"}
        buttonHref={"/material-management/categories/sub-categories/add"}
      />

      <FlexContainer variant="row-end">
        <Button variant={"outline"} onClick={handleCreateMainCategories}>
          Create Main Categories
        </Button>
        <div>
          <Select
            name="mainCategory"
            // label="Main Categories"
            aria-label="Main Categories"
            placeholder="Select Main Category"
            radius="sm"
            classNames={{
              label: "font-medium text-zinc-900",
              trigger: "border border-zinc-200 bg-white text-black w-64",
              helperWrapper: "text-black placeholder-zinc-900",
            }}
            items={mainCategoryData || []}
            description={mainCategoryError?.message}
            onChange={(e) => {
              setSelectedMainCategory(e.target.value);
              if (e?.target?.value?.length > 0) {
                e.target.hidePopover();
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
      <FlexContainer variant="column-start" gap="xl">
        {mainCategoryLoading && <Loader />}
        {!mainCategoryLoading && (
          <Table aria-label="Purchase Order" className="mt-4">
            <TableHeader>
              <TableColumn>Main Category</TableColumn>
              <TableColumn>Sub Category Name</TableColumn>
              {/* <TableColumn>Main Category</TableColumn> */}
              <TableColumn>Active Status</TableColumn>
              <TableColumn>Created At</TableColumn>
              <TableColumn>Action</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={
                subCategoriesError?.message || "No Sub Categories found"
              }
            >
              {!subCategoriesLoading && subCategoriesData?.length
                ? subCategoriesData?.map((category) => (
                    <TableRow key={category?.uniqueId}>
                      <TableCell>{category?.mainCategory?.name}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      {/* <TableCell>{category.mainCategory.name}</TableCell> */}
                      <TableCell>
                        {category.status ? "Active" : "Inactive"}
                      </TableCell>
                      <TableCell>
                        {/* createdAt : "1727206442204" */}
                        {/* {dayjs(category.createdAt).format("DD MMM, YYYY")} */}
                        {dayjs(Number(category.createdAt)).format(
                          "DD MMM, YYYY"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size={"icon"}
                          onClick={async () => {
                            try {
                              const res = await axios.delete(
                                `${API_URL}/deleteSubCategory?uniqueId=${category?.uniqueId}`
                              );
                              toast.success(
                                res?.data?.message ||
                                  "Sub Category deleted successfully"
                              );
                              refreshSubCategories(API_TAGS.GET_SUB_CATEGORY);
                            } catch (error) {
                              const err = error as Error & {
                                response: { data: { error: string } };
                              };
                              toast.error(
                                err?.response?.data?.error ||
                                  "An error occurred"
                              );
                            }
                          }}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                : []}
            </TableBody>
          </Table>
        )}
      </FlexContainer>
    </FlexContainer>
  );
};

export default MaterialCategories;
