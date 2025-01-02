import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import Loader from "@/components/layout/Loader";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/api";
import { Chip, Input } from "@nextui-org/react";
import { Pencil, Trash } from "lucide-react";
import toast from "react-hot-toast";

function ListUser() {
  const [userList, setUserList] = useState<
    {
      uniqueId: string;
      fname: string;
      lname: string;
      email: string;
      role: string;
      isActive: boolean;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const groupUniqueId = JSON.parse(
    localStorage.getItem("_session") as string
  ).groupUniqueId;

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const response = await api(`/user/${id}`, {}, "delete");
      toast.success(response.success);
      setReload(!reload);
    } catch (error) {
      const err = error as Error & { error: string };
      console.log(err);
      toast.error(err.error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/user/${id}`);
  };

  useEffect(() => {
    setLoading(true);
    (async function () {
      try {
        const response = await api(`/users/${groupUniqueId}`, {}, "get");
        setUserList(response.data || []);
      } catch (error) {
        const err = error as Error & { error: string };
        console.log(err);
        toast.error(err.error);
      } finally {
        setLoading(false);
      }
    })();
  }, [reload]);

  return (
    <FlexContainer variant="column-start" gap="2xl">
      <ActionArea
        heading="User"
        subheading="List"
        title="List of Users"
        buttonHref="/users/create"
        buttonText="Create User"
        showButton={true}
      />
      {!loading ? (
        <Table
          aria-label="Users Table"
          // removeWrapper
          shadow="none"
          radius="lg"
          classNames={{ wrapper: "border" }}
        >
          <TableHeader>
            <TableColumn>Name</TableColumn>
            <TableColumn>Email</TableColumn>
            <TableColumn>Role</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn>Options</TableColumn>
          </TableHeader>
          <TableBody emptyContent={"No rows to display."} items={userList}>
            {(user) => (
              <TableRow key={user.uniqueId} className="">
                <TableCell>
                  {user.fname} {user.lname}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell>
                  <Chip
                    className="capitalize"
                    color={user.isActive ? "success" : "danger"}
                    size="sm"
                    variant="flat"
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <ActionColumn
                    id={user.uniqueId}
                    setReload={setReload}
                    reload={reload}
                    handleEdit={(id) => handleEdit(id)}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      ) : (
        <Loader />
      )}
    </FlexContainer>
  );
}

const ActionColumn = ({
  id = "",
  setReload,
  reload = false,
  handleEdit,
}: {
  id: string;
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
  reload: boolean;
  handleEdit: (id: string) => void;
}) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await api(`/user/${id}`, {}, "delete");
      toast.success(response.success);
      setReload(!reload);
    } catch (error) {
      const err = error as Error & { error: string };
      console.log(err);
      toast.error(err.error);
    } finally {
      setDeleting(false);
    }
  };
  return (
    <FlexContainer variant="row-start">
      {!deleting && (
        <Button
          onClick={handleDelete}
          variant="destructive"
          size="icon"
          isLoading={deleting}
        >
          <Trash className="w-4` h-4" />
        </Button>
      )}
      <Button variant="outline" size="icon" onClick={() => handleEdit(id)}>
        <Pencil className="w-4 h-4" />
      </Button>
    </FlexContainer>
  );
};

export default ListUser;
