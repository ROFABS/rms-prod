import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import Loader from "@/components/layout/Loader";
import { Button } from "@/components/ui/button";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { useGlobalContext } from "@/store/GlobalContext";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { EllipsisVertical } from "lucide-react";
import React, { useEffect } from "react";
import { Vendor } from "./types";

const VendorsManagement = () => {
  const { selectedRestaurant } = useGlobalContext();
  const {
    data: allVendorsData,
    error: allVendorsError,
    loading: allVendorsLoading,
    invalidateCache: invalidateAllVendorsCache,
    refresh: refreshAllVendorsData,
    getData: getAllVendorsData,
  } = useGet<Vendor[]>({ showToast: false });

  useEffect(() => {
    if (selectedRestaurant?.uniqueId) {
      getAllVendorsData(
        `${API_URL}/getVendors?restaurantId=${selectedRestaurant.uniqueId}`,
        API_TAGS.GET_VENDORS
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);

  return (
    <FlexContainer variant="column-start" gap="xl">
      <ActionArea
        heading={"Management"}
        subheading={"Vendors"}
        title={"Manage Vendors"}
        showButton={true}
        buttonHref={"add"}
        buttonText={"Add Vendor"}
      />
      <VendorList data={allVendorsData} isLoading={allVendorsLoading} />
    </FlexContainer>
  );
};

const VendorList = ({
  data,
  isLoading,
}: {
  data: Vendor[] | null;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return <Loader />;
  }
  return (
    <Table aria-label="Vendors List">
      <TableHeader>
        <TableColumn>Name</TableColumn>
        <TableColumn>Email</TableColumn>
        <TableColumn>Phone</TableColumn>
        <TableColumn>Address</TableColumn>
        <TableColumn>Vendor Categories</TableColumn>
        <TableColumn>Vendor type</TableColumn>
        <TableColumn className="rounded-r-xl">Vendor Status</TableColumn>
        <TableColumn className="bg-white"> </TableColumn>
      </TableHeader>
      <TableBody emptyContent="No Vendors found">
        {!isLoading && data?.length
          ? data?.map((item, i) => {
              return (
                <TableRow
                  // href={`/vendors/details/${item?.uniqueId}`}
                  key={item?.uniqueId}
                  className="cursor-pointer"
                >
                  <TableCell>{item?.vendorName}</TableCell>
                  <TableCell>{item?.vendorEmail}</TableCell>
                  <TableCell>{item?.vendorPhoneNumber}</TableCell>
                  <TableCell>{item?.vendorAddress}</TableCell>
                  <TableCell className="max-w-xs">
                    {item?.vendorCategories?.map((c) => c?.name)?.join(", ")}
                  </TableCell>
                  <TableCell>
                    {item?.selfVending === "true"
                      ? "Self Vending"
                      : "Third Party Vending"}
                  </TableCell>
                  <TableCell>
                    {item?.vendorStatus ? (
                      <span className="text-green-500 font-medium">Active</span>
                    ) : (
                      <span className="text-rose-500 font-medium">
                        In Active
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button size={"icon"} variant={"ghost"}>
                          <EllipsisVertical className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Static Actions">
                        <DropdownItem key="edit">Edit</DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              );
            })
          : []}
      </TableBody>
    </Table>
  );
};

export default VendorsManagement;
