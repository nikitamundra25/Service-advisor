import React, { Component } from "react";
import { Table, Badge } from "reactstrap";
import Loader from "../../../containers/Loader/Loader";
import { formateDate } from "../../../helpers/Date";
import PaginationHelper from "../../../helpers/Pagination";
class FleetList extends Component {
  render() {
    const { userData } = this.props;
    const { users, isLoading, totalUsers } = userData;
    return (
      <>
        <Table responsive bordered>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Vehicles</th>
              <th>Orders</th>
              <th>Lables</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              users.length ? (
                users.map((user, index) => {
                  return (
                    <tr key={index}>
                      <td>{user.firstName || "-"}</td>
                      <td>{user.lastName || "-"}</td>
                      <td>{user.email || "-"}</td>
                      <td>
                        {user.createdAt ? formateDate(user.createdAt) : "-"}
                      </td>
                      <td>{user.role || "-"}</td>
                      <td>
                        <Badge color="success">Active</Badge>
                      </td>
                      <td>
                        <i className={"fa fa-edit"} /> &nbsp;
                        <i className={"fa fa-trash"} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                  <tr>
                    <td className={"text-center"} colSpan={8}>
                      No Fleet Found
                  </td>
                  </tr>
                )
            ) : (
                <tr>
                  <td className={"text-center"} colSpan={8}>
                    <Loader />
                  </td>
                </tr>
              )}
          </tbody>
        </Table>
        {totalUsers ? (
          <PaginationHelper
            totalRecords={totalUsers}
            onPageChanged={this.props.onPageChange}
          />
        ) : null}
      </>
    );
  }
}

export default FleetList;