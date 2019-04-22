import React, { Component } from "react";
// import Validator from "js-object-validation";
import * as classnames from "classnames";
import MaskedInput from "react-maskedinput";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  FormFeedback
} from "reactstrap";
import Select from "react-select";
import { AppSwitch } from "@coreui/react";
import { CrmFleetModal } from "../common/CrmFleetModal";
import { CrmStandardModel } from "../common/CrmStandardModel";
import { PhoneOptions } from "../../config/Constants";
import {
  CustomerDefaultPermissions,
  CustomerPermissionsText
} from "../../config/Constants";
import { AppConfig } from "../../config/AppConfig";
import {
  CreateCustomerValidations,
  CreateCustomerValidMessaages,
  CreateRateValidations,
  CreateRateValidMessaages
} from "../../validations";
import { logger } from "../../helpers/Logger";
import Validator from "js-object-validation";
import Async from "react-select/lib/Async";
import { ApiHelper } from "../../helpers/ApiHelper";
import { toast } from "react-toastify";

export class CrmCustomerModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: "",
      expandForm: false,
      fleetModalOpen: false,
      firstName: "",
      lastName: "",
      phoneDetail: [
        {
          phone: "mobile",
          value: ""
        }
      ],
      email: "",
      notes: "",
      companyName: "",
      referralSource: "",
      fleet: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zipCode: "",
      customerDefaultPermissions: CustomerDefaultPermissions,
      errors: {},
      phoneErrors: [""],
      phoneLength: AppConfig.phoneLength,
      openStadardRateModel: false,
      defaultOptions: [{ value: "", label: "Add New Customer" }],
      selectedLabourRate: { value: "", label: "Select..." }
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.customerModalOpen !== this.props.customerModalOpen) {
      this.removeAllState();
    }
  }

  setStateAsync(state) {
    return new Promise(resolve => {
      this.setState(state, resolve);
    });
  }

  handleClick(singleState, e) {
    const { customerDefaultPermissions } = this.state;
    customerDefaultPermissions[singleState].status = e.target.checked;
    if (singleState === "shouldLaborRateOverride") {
      if (!this.state.selectedLabourRate.length) {
        this.setState({
          selectedLabourRate: { value: "", label: "Select..." }
        });
      }
    }
    this.setState({
      ...customerDefaultPermissions
    });
  }

  handleRateAdd = async data => {
    const profileData = this.props.profileInfo.profileInfo;
    let api = new ApiHelper();

    try {
      const { isValid, errors } = Validator(
        data,
        CreateRateValidations,
        CreateRateValidMessaages
      );
      if (!isValid) {
        this.setState({
          errors: errors,
          isLoading: false
        });
        return;
      } else {
        const ratedata = {
          data: data,
          userId: profileData._id,
          parentId: profileData.parentId
        };
        let result = await api.FetchFromServer(
          "/labour",
          "/addRate",
          "POST",
          true,
          undefined,
          ratedata
        );
        if (result.isError) {
          toast.error(result.messages[0]);
        } else {
          toast.success(result.messages[0]);
          this.setState({
            openStadardRateModel: !this.state.openStadardRateModel,
            selectedLabourRate: {
              value: result.data.data._id,
              label: result.data.data.name + " - " + result.data.data.hourlyRate
            }
          });
          this.props.onStdAdd();
          //this.props.setDefaultRate({value: result.data.data._id, label: result.data.data.name});
        }
      }
    } catch (error) {
      logger(error);
    }
  };

  handlePercentageChange = e => {
    const { customerDefaultPermissions } = this.state;
    customerDefaultPermissions["shouldReceiveDiscount"].percentageDiscount =
      e.target.value;
    this.setState({
      ...customerDefaultPermissions
    });
  };
  handleMatrixChange = e => {
    const { customerDefaultPermissions } = this.state;
    customerDefaultPermissions["shouldPricingMatrixOverride"].pricingMatrix =
      e.target.value;
    this.setState({
      ...customerDefaultPermissions
    });
  };

  handleChange = selectedOption => {
    if (selectedOption) {
      this.setState({
        selectedOption: selectedOption,
        fleet: selectedOption.value
      });
    } else {
      this.setState({
        selectedOption: {
          value: "",
          label: "Select..."
        }
      });
    }
  };

  handleExpandForm = () => {
    this.setState({
      expandForm: !this.state.expandForm
    });
  };

  handleInputChange = e => {
    const { target } = e;
    const { name, value } = target;
    this.setState({
      [name]: value
    });
  };

  stdModelFun = () => {
    this.setState({
      openStadardRateModel: !this.state.openStadardRateModel
    });
  };

  handlePhoneNameChange = (index, event) => {
    const { value } = event.target;
    const phoneDetail = [...this.state.phoneDetail];
    phoneDetail[index].phone = value;
    this.setState({
      phoneDetail
    });
  };

  handlePhoneValueChange = (index, event) => {
    const { value } = event.target;
    const phoneDetail = [...this.state.phoneDetail];
    phoneDetail[index].value = value;
    this.setState({
      phoneDetail
    });
  };

  handleAddPhoneDetails = () => {
    const { phoneDetail } = this.state;
    if (phoneDetail.length < 3) {
      this.setState((state, props) => {
        return {
          phoneDetail: state.phoneDetail.concat([
            {
              phone: "mobile",
              value: ""
            }
          ]),
          phoneErrors: state.phoneErrors.concat([""])
        };
      });
    }
  };

  handleRemovePhoneDetails = index => {
    const { phoneDetail, phoneErrors } = this.state;
    let t = [...phoneDetail];
    let u = [...phoneErrors];
    t.splice(index, 1);
    u.splice(index, 1);
    if (phoneDetail.length) {
      this.setState({
        phoneDetail: t,
        phoneErrors: u
      });
    }
  };

  handleStandardRate = selectValue => {
    if (selectValue) {
      if (selectValue.value === "") {
        this.setState({
          openStadardRateModel: !this.state.openStadardRateModel
        });
      } else {
        const { customerDefaultPermissions } = this.state;
        customerDefaultPermissions["shouldLaborRateOverride"].laborRate =
          selectValue.value;
        this.setState({
          ...customerDefaultPermissions,
          selectedLabourRate: selectValue
        });

        this.props.setDefaultRate(selectValue);
      }
    } else {
      this.props.onTypeHeadStdFun({});
      this.setState({
        selectedLabourRate: {
          value: "",
          label: "Select..."
        }
      });
    }
  };

  loadOptions = async input => {
    return this.props.loadTypeRate(input);
  };

  addNewCustomer = async () => {
    const {
      firstName,
      lastName,
      phoneDetail,
      email,
      notes,
      companyName,
      referralSource,
      address1,
      address2,
      city,
      state,
      zipCode,
      customerDefaultPermissions,
      fleet
    } = this.state;

    const customerData = {
      firstName: firstName,
      lastName: lastName,
      phoneDetail: phoneDetail,
      email: email,
      notes: notes,
      companyName: companyName,
      referralSource: referralSource,
      address1: address1,
      address2: address2,
      city: city,
      state: state,
      zipCode: zipCode,
      fleet: fleet,
      permission: customerDefaultPermissions,
      status: true
    };

    try {
      if (phoneDetail.length) {
        let t = [];
        this.setState({ phoneErrors: t });
        await Promise.all(
          phoneDetail.map(async (key, i) => {
            if (key.value.length) {
              // t[i] = null
            } else {
              t[i] = "Phone number is required";
            }
          })
        );
        await this.setStateAsync({ phoneErrors: t });
      }
      let validationData = {
        firstName: firstName
      };
      if (email !== "") {
        validationData.email = email;
      }
      const { isValid, errors } = Validator(
        validationData,
        CreateCustomerValidations,
        CreateCustomerValidMessaages
      );
      this.setState({ errors: {} });
      if (
        !isValid ||
        Object.keys(this.state.phoneErrors).length > 0 ||
        customerData.firstName === ""
      ) {
        this.setState({
          errors: errors,
          isLoading: false
        });
        return;
      }
      this.props.addCustomerFun(customerData);
    } catch (error) {
      logger(error);
    }
  };

  async removeAllState() {
    this.setState({
      firstName: "",
      lastName: "",
      phoneDetail: [
        {
          phone: "mobile",
          value: ""
        }
      ],
      email: "",
      notes: "",
      companyName: "",
      referralSource: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zipCode: "",
      fleet: "",
      errors: {},
      selectedLabourRate: {},
      customerDefaultPermissions: CustomerDefaultPermissions,
      phoneErrors: [""],
      expandForm: false
    });
  }

  handleCustomerModal = () => {
    this.props.handleCustomerModalFun();
    if (this.props.customerModalOpen) {
      //this.removeAllState();
    }
  };

  render() {
    const {
      customerModalOpen,
      matrixListReducerData,
      rateStandardListData,
      getCustomerFleetList
    } = this.props;
    const {
      selectedOption,
      expandForm,
      fleetModalOpen,
      phoneDetail,
      errors,
      firstName,
      lastName,
      email,
      selectedLabourRate
    } = this.state;
    const phoneOptions = PhoneOptions.map((item, index) => {
      return (
        <option value={item.key} key={index}>
          {item.text}
        </option>
      );
    });

    let customerDefaultPermissions = this.state.customerDefaultPermissions;
    if (!customerDefaultPermissions) {
      customerDefaultPermissions = {};
      for (const key in CustomerDefaultPermissions) {
        if (CustomerDefaultPermissions.hasOwnProperty(key)) {
          const element = CustomerDefaultPermissions[key];
          customerDefaultPermissions[key] = element;
        }
      }
    }
    const options = [];
    getCustomerFleetList &&
      getCustomerFleetList.map((data, index) => {
        options.push({ value: `${data._id}`, label: `${data.companyName}` });
        return true;
      });
    return (
      <>
        <Modal
          isOpen={customerModalOpen}
          toggle={this.handleCustomerModal}
          className={"customer-modal custom-form-modal custom-modal-lg"}
        >
          <ModalHeader toggle={this.handleCustomerModal}>
            {"Create New Customer"}
          </ModalHeader>
          <ModalBody>
            <div className="">
              <Row className="justify-content-center">
                <Col md="6">
                  <FormGroup>
                    <Label htmlFor="name" className="customer-modal-text-style">
                      First Name <span className={"asteric"}>*</span>
                    </Label>
                    <div className={"input-block"}>
                      <Input
                        type="text"
                        placeholder="John"
                        name="firstName"
                        onChange={this.handleInputChange}
                        value={firstName}
                        maxLength="30"
                        invalid={!firstName && errors.firstName}
                      />
                      <FormFeedback>
                        {!firstName && errors.firstName
                          ? errors.firstName
                          : null}
                      </FormFeedback>
                    </div>
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label htmlFor="name" className="customer-modal-text-style">
                      Last Name
                    </Label>
                    <div className={"input-block"}>
                      <Input
                        type="text"
                        placeholder="Doe"
                        onChange={this.handleInputChange}
                        name="lastName"
                        value={this.state.lastName}
                        maxLength="30"
                      />
                      {errors.lastName && !lastName ? (
                        <p className="text-danger">{errors.lastName}</p>
                      ) : null}
                    </div>
                  </FormGroup>
                </Col>
              </Row>
              <Row className="">
                {phoneDetail && phoneDetail.length
                  ? phoneDetail.map((item, index) => {
                      return (
                        <React.Fragment key={index}>
                          {index < 1 ? (
                            <>
                              <Col md="6">
                                <FormGroup className="phone-number-feild">
                                  <Label
                                    htmlFor="name"
                                    className="customer-modal-text-style"
                                  >
                                    Phone <span className={"asteric"}>*</span>
                                  </Label>
                                  {/* <div></div> */}

                                  <Input
                                    onChange={e =>
                                      this.handlePhoneNameChange(index, e)
                                    }
                                    type="select"
                                    id="name"
                                    required
                                  >
                                    {phoneOptions}
                                  </Input>
                                  {phoneDetail[index].phone === "mobile" ? (
                                    <div className="input-block select-number-tile">
                                      <MaskedInput
                                        mask="(111) 111-111"
                                        name="phoneDetail"
                                        placeholder="(555) 055-0555"
                                        className={classnames("form-control", {
                                          "is-invalid":
                                            this.state.phoneErrors[index] !== ""
                                        })}
                                        size="20"
                                        value={item.value}
                                        onChange={e =>
                                          this.handlePhoneValueChange(index, e)
                                        }
                                      />
                                      <FormFeedback>
                                        {this.state.phoneErrors[index]}
                                      </FormFeedback>
                                    </div>
                                  ) : (
                                    <div className="input-block select-number-tile">
                                      <MaskedInput
                                        mask="(111) 111-111 ext 1111"
                                        name="phoneDetail"
                                        className={classnames("form-control", {
                                          "is-invalid":
                                            this.state.phoneErrors[index] !== ""
                                        })}
                                        placeholder="(555) 055-0555 ext 1234"
                                        size="20"
                                        value={item.value}
                                        onChange={e =>
                                          this.handlePhoneValueChange(index, e)
                                        }
                                      />
                                      <FormFeedback>
                                        {this.state.phoneErrors[index]}
                                      </FormFeedback>
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col md="6">
                                <FormGroup>
                                  <Label
                                    htmlFor="name"
                                    className="customer-modal-text-style"
                                  >
                                    Email
                                  </Label>
                                  <div className="input-block">
                                    <Input
                                      type="text"
                                      className="customer-modal-text-style"
                                      placeholder="john.doe@example.com"
                                      onChange={this.handleInputChange}
                                      name="email"
                                      value={this.state.email}
                                      maxLength="100"
                                    />
                                    {errors.email && email ? (
                                      <p className="text-danger">
                                        {errors.email}
                                      </p>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </>
                          ) : (
                            <>
                              <Col md="6">
                                <button
                                  onClick={() =>
                                    this.handleRemovePhoneDetails(index)
                                  }
                                  className="btn btn-danger btn-sm btn-round input-close"
                                >
                                  <i className="fa fa-close" />
                                </button>
                                <FormGroup className="phone-number-feild">
                                  <Label
                                    htmlFor="name"
                                    className="customer-modal-text-style"
                                  >
                                    Phone
                                  </Label>
                                  {/* <div></div> */}
                                  <Input
                                    onChange={e =>
                                      this.handlePhoneNameChange(index, e)
                                    }
                                    type="select"
                                    id="name"
                                    required
                                  >
                                    {phoneOptions}
                                  </Input>
                                  {phoneDetail[index].phone === "mobile" ? (
                                    <div className="input-block select-number-tile">
                                      <MaskedInput
                                        mask="(111) 111-111"
                                        name="phoneDetail"
                                        placeholder="(555) 055-0555"
                                        className={classnames("form-control", {
                                          "is-invalid":
                                            this.state.phoneErrors[index] !== ""
                                        })}
                                        size="20"
                                        value={item.value}
                                        onChange={e =>
                                          this.handlePhoneValueChange(index, e)
                                        }
                                      />
                                      <FormFeedback>
                                        {this.state.phoneErrors[index]}
                                      </FormFeedback>
                                    </div>
                                  ) : (
                                    <div className="input-block select-number-tile">
                                      <MaskedInput
                                        mask="(111) 111-111 ext 1111"
                                        name="phoneDetail"
                                        className={classnames("form-control", {
                                          "is-invalid":
                                            this.state.phoneErrors[index] !== ""
                                        })}
                                        placeholder="(555) 055-0555 ext 1234"
                                        size="20"
                                        value={item.value}
                                        onChange={e =>
                                          this.handlePhoneValueChange(index, e)
                                        }
                                      />
                                      <FormFeedback>
                                        {this.state.phoneErrors[index]}
                                      </FormFeedback>
                                    </div>
                                  )}
                                </FormGroup>
                              </Col>
                            </>
                          )}
                        </React.Fragment>
                      );
                    })
                  : null}

                {phoneDetail.length < 3 ? (
                  <Col md="12">
                    <FormGroup className={"mb-0"}>
                      <Label className={"customer-modal-text-style"} />
                      <span
                        onClick={this.handleAddPhoneDetails}
                        className="customer-add-phone customer-anchor-text customer-click-btn"
                      >
                        Add another phone number
                      </span>
                    </FormGroup>
                  </Col>
                ) : null}
              </Row>
              <Row>
                <Col md="6">
                  <FormGroup>
                    <Label htmlFor="name" className="customer-modal-text-style">
                      Company
                    </Label>
                    <Input
                      type="text"
                      placeholder="Company"
                      name="companyName"
                      onChange={this.handleInputChange}
                      value={this.state.companyName}
                      maxLength="100"
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup className={"fleet-block"}>
                    <Label htmlFor="name" className="customer-modal-text-style">
                      Fleet
                    </Label>
                    <Select
                      value={selectedOption}
                      onChange={this.handleChange}
                      className="w-100 form-select"
                      options={options}
                      isClearable={selectedOption.value !== "" ? true : false}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row className="justify-content-center">
                <div>
                  {!expandForm ? (
                    <span
                      onClick={this.handleExpandForm}
                      className="customer-anchor-text customer-click-btn"
                    >
                      {" "}
                      Show More{" "}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
              </Row>
            </div>
            {expandForm ? (
              <>
                <Row className="justify-content-center">
                  <Col md="6">
                    <FormGroup>
                      <Label
                        htmlFor="name"
                        className="customer-modal-text-style"
                      >
                        Address
                      </Label>
                      <Input
                        type="text"
                        placeholder="Address"
                        name="address1"
                        onChange={this.handleInputChange}
                        maxLength="200"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label
                        htmlFor="name"
                        className="customer-modal-text-style"
                      >
                        City
                      </Label>
                      <Input
                        type="text"
                        placeholder="New York"
                        name="city"
                        onChange={this.handleInputChange}
                        maxLength="30"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="">
                  <Col md="6">
                    <FormGroup>
                      <Label
                        htmlFor="name"
                        className="customer-modal-text-style"
                      >
                        State
                      </Label>
                      <Input
                        type="text"
                        name="state"
                        onChange={this.handleInputChange}
                        placeholder="NY"
                        maxLength="30"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6 ">
                    <FormGroup>
                      <Label
                        htmlFor="name"
                        className="customer-modal-text-style"
                      >
                        Zip Code
                      </Label>
                      <Input
                        type="text"
                        placeholder="Zip Code"
                        name="zipCode"
                        onChange={this.handleInputChange}
                        maxLength="6"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label
                        htmlFor="name"
                        className="customer-modal-text-style"
                      >
                        Referral Source
                      </Label>
                      <Input
                        type="text"
                        placeholder="Referral"
                        name="Refferal Source"
                        onChange={this.handleInputChange}
                        maxLength="100"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="custom-label-padding ">
                  {CustomerPermissionsText
                    ? CustomerPermissionsText.map((permission, index) => {
                        let discountShow = false;
                        let labourRate = false;
                        let pricingMatrix = false;
                        if (
                          permission.key === "shouldReceiveDiscount" &&
                          customerDefaultPermissions[permission.key].status
                        ) {
                          discountShow = true;
                        }

                        if (
                          permission.key === "shouldLaborRateOverride" &&
                          customerDefaultPermissions[permission.key].status
                        ) {
                          labourRate = true;
                        }

                        if (
                          permission.key === "shouldPricingMatrixOverride" &&
                          customerDefaultPermissions[permission.key].status
                        ) {
                          pricingMatrix = true;
                        }

                        return (
                          <React.Fragment key={index}>
                            <Col
                              md="6"
                              key={index}
                              className={
                                permission.key === "shouldPricingMatrixOverride"
                                  ? "price-matrix"
                                  : null
                              }
                            >
                              <div className="d-flex">
                                <AppSwitch
                                  className={"mx-1"}
                                  checked={
                                    customerDefaultPermissions[permission.key]
                                      .status
                                  }
                                  onClick={this.handleClick.bind(
                                    this,
                                    permission.key
                                  )}
                                  variant={"3d"}
                                  color={"primary"}
                                  size={"sm"}
                                />
                                <p className="customer-modal-text-style">
                                  {permission.text}
                                </p>
                              </div>
                              {discountShow ? (
                                <div
                                  className="custom-label d-flex col-12"
                                  key={index}
                                >
                                  <Label
                                    htmlFor="name"
                                    className="customer-modal-text-style mr-2"
                                  >
                                    Percent Discount
                                  </Label>
                                  <FormGroup className={"mb-2"}>
                                    <Col md="5" className={"p-0"}>
                                      <MaskedInput
                                        mask="11\.11 \%"
                                        name="percentageDiscount"
                                        size="20"
                                        onChange={this.handlePercentageChange}
                                        className="form-control"
                                        placeholder="00.00%"
                                      />
                                    </Col>
                                  </FormGroup>
                                </div>
                              ) : null}
                              {labourRate ? (
                                <Col
                                  md=""
                                  className={"fleet-block rate-standard-list"}
                                >
                                  <Async
                                    defaultOptions={
                                      rateStandardListData.standardRateList
                                    }
                                    loadOptions={this.loadOptions}
                                    onChange={this.handleStandardRate}
                                    isClearable={
                                      selectedLabourRate.value !== ""
                                        ? true
                                        : false
                                    }
                                    value={selectedLabourRate}
                                  />
                                </Col>
                              ) : null}
                              {/* */}
                              {pricingMatrix ? (
                                <Col md="12">
                                  <FormGroup className={"mb-2"}>
                                    <Input
                                      type="select"
                                      className=""
                                      onChange={this.handleMatrixChange}
                                      name="matrixType"
                                      id="matrixId"
                                    >
                                      <option value={""}>Select</option>
                                      {matrixListReducerData.matrixList.length
                                        ? matrixListReducerData.matrixList.map(
                                            (item, index) => {
                                              return (
                                                <option
                                                  value={item._id}
                                                  key={index}
                                                >
                                                  {item.name}
                                                </option>
                                              );
                                            }
                                          )
                                        : null}
                                    </Input>
                                  </FormGroup>
                                </Col>
                              ) : null}
                            </Col>
                          </React.Fragment>
                        );
                      })
                    : null}
                </Row>
                {expandForm ? (
                  <Col md="12 text-center pt-3">
                    <span
                      onClick={this.handleExpandForm}
                      className="customer-anchor-text customer-click-btn"
                    >
                      {" "}
                      Show Less{" "}
                    </span>
                  </Col>
                ) : null}
              </>
            ) : (
              ""
            )}
            {fleetModalOpen ? <CrmFleetModal /> : ""}
            <CrmStandardModel
              openStadardRateModel={this.state.openStadardRateModel}
              stdModelFun={this.stdModelFun}
              errors={errors}
              handleRateAdd={this.handleRateAdd}
            />
          </ModalBody>
          <ModalFooter>
            <div className="required-fields">*Fields are Required.</div>
            <Button color="primary" onClick={this.addNewCustomer}>
              {"Add Customer"}
            </Button>{" "}
            <Button color="secondary" onClick={this.handleCustomerModal}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  }
}
