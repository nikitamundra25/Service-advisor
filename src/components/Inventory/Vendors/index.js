import React, { Component } from "react";
import { connect } from "react-redux";
import * as qs from "query-string";
import Loader from "../../../containers/Loader/Loader";
import CrmInventoryVendor from "../../../components/common/CrmInventoryVendor";
import { ConfirmBox } from "../../../helpers/SweetAlert";
import {
  Table,
  Button,
  UncontrolledTooltip,
} from "reactstrap";
import {
  getVendorsList,
  editVendor,
  deleteVendor,
} from "../../../actions";

class Vendors extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vendor:{},
    };
  }

  componentDidMount = () =>{
    const query = qs.parse(this.props.location.search);
    this.props.getVendorsList({ ...query, page: query.page || 1 });
  }
  componentDidUpdate({ vendorReducer, location }) {
    if (
      this.props.vendorReducer.vendorData.isSuccess !==
      vendorReducer.vendorData.isSuccess
    ) {
      const query = qs.parse(this.props.location.search);
      this.props.getVendorsList({ ...query, page: query.page || 1 });
    }

  }
  editVendor = vendor => {
    this.setState({ vendor: vendor }, () => {
      this.props.modelOperate({
        vendorEditModalOpen: true
      });
    });
  };

  onUpdate = (id, data) =>{
    this.props.updateVendor(id, data);
  }

  deleteVendor = async ( vendorId) => {
    const { value } = await ConfirmBox({
      text:"Do you want to delete this Vendor"
    });
    if (!value) {
      console.log("Cancle", vendorId)
      return;
    }
    const data = { vendorId: vendorId} 
    this.props.deleteVendor(data)
    console.log("Success", data)
  }

  render() {
    const { vendor } = this.state;
    const { vendorReducer, modelOperate, modelInfoReducer } = this.props;
    const { modelDetails } = modelInfoReducer;
    const { vendorEditModalOpen } = modelDetails;
    const { vendors, isLoading } = vendorReducer;
    return (
      <>
        <Table responsive bordered className={"mt-3"}>
          <thead>
            <tr>
              <th className={"text-center"}>S No.</th>
              <th>Vendor Name</th>
              <th>URL</th>
              <th>Account Number</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading ? (
            vendors.length ? vendors.map((vendor, index) => {
                return (
                  <tr key={index}>
                      <td className={"text-center"}>{index + 1}</td>
                      <td>{vendor.name}</td>
                    <td>{vendor.url ? <a href={vendor.url} target={"_blank"}>{vendor.url}</a> : 'NA'}</td>
                      <td>{vendor.accountNumber ? vendor.accountNumber : 'NA'}</td>
                      <td className={"text-capitalize"}>
                        {vendor.contactPerson.firstName ? vendor.contactPerson.firstName : 'NA'}
                      </td>
                      <td className={"text-capitalize"}>
                      {vendor.contactPerson.lastName ? vendor.contactPerson.lastName : 'NA'}
                      </td>
                      <td>{vendor.contactPerson.email ? vendor.contactPerson.email : 'NA'}</td>
                      <td className={"text-capitalize"}>
                        {vendor.contactPerson.phoneNumber && vendor.contactPerson.phoneNumber.phone && vendor.contactPerson.phoneNumber.value !== '' ? vendor.contactPerson.phoneNumber.phone : 'NA'} 

                        {vendor.contactPerson.phoneNumber.value ? <span>&nbsp;<b>|</b>&nbsp;</span> : ''}

                        {vendor.contactPerson.phoneNumber && vendor.contactPerson.phoneNumber.phone ? vendor.contactPerson.phoneNumber.value : 'NA'}
                      </td>
                      <td>
                        <Button
                          color={"primary"}
                          size={"sm"}
                          onClick={() => this.editVendor(vendor)}
                          id={`edit-${vendor._id}`}
                        >
                          <i className={"fa fa-edit"} />
                        </Button>
                        <UncontrolledTooltip target={`edit-${vendor._id}`}>
                          Edit details of {vendor.name}
                        </UncontrolledTooltip>
                        &nbsp;
                        <Button
                          color={"danger"}
                          size={"sm"}
                          id={`delete-${vendor._id}`}
                          onClick={() => this.deleteVendor(vendor._id)}
                        >
                          <i className={"fa fa-trash"} />
                        </Button>
                        <UncontrolledTooltip target={`delete-${vendor._id}`}>
                          Delete {vendor.firstName}
                        </UncontrolledTooltip>
                      </td>
                  </tr>
                );
                })
                :
                <tr>
                  <td colSpan={"9"}>
                    No any vendor is available
                  </td>
                </tr>
            ) : (
                <tr>
                  <td className={"text-center"} colSpan={12}>
                    <Loader />
                  </td>
                </tr>
              )}
              
          </tbody>
        </Table>
        <CrmInventoryVendor
          updateVendor={this.onUpdate}
          vendorAddModalOpen={vendorEditModalOpen}
          handleVendorAddModal={() =>
            modelOperate({
              vendorEditModalOpen: !vendorEditModalOpen
            })
          }
          vendorData={vendor}
        />
      </>
    )
  }
}

const mapStateToProps = state => ({
  vendorReducer: state.vendorsReducer,
  modelInfoReducer: state.modelInfoReducer
});

const mapDispatchToProps = dispatch => ({
  getVendorsList: data => {
    dispatch(getVendorsList(data));
  },
  updateVendor: (id, data) => {
    dispatch(editVendor({id, data}));
  },
  deleteVendor: data => {
    dispatch(deleteVendor(data));
  },
})


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Vendors);