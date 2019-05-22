import React, { Component } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Col,
  FormGroup,
  FormFeedback,
  Label,
  Input
} from "reactstrap";
import Select from "react-select";

import { ColorOptions, groupedOptions } from "../../../config/Color";
import { Transmission, Drivetrain } from "../../../config/Constants";
import MaskedInput from "react-maskedinput";
import {
  VehicleValidations,
  VehicleValidationMessage
} from "../../../validations";
import Validator from "js-object-validation";
import LastUpdated from "../../common/LastUpdated";
import * as classnames from "classnames";

class CustomOption extends Component {
  render() {
    const { data, innerProps } = this.props;
    let style = {
      backgroundColor: data.color
    };
    return (
      <div {...innerProps} className="cursor_pointer vehicles-select-color-block">
        <span style={style} className="vehicles-select-color" />
        {data.label}
      </div>
    );
  }
}
const groupStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
};
const groupBadgeStyles = {
  backgroundColor: "#EBECF0",
  borderRadius: "2em",
  color: "#172B4D",
  display: "inline-block",
  fontSize: 12,
  fontWeight: "normal",
  lineHeight: "1",
  minWidth: 1,
  padding: "0.16666666666667em 0.5em",
  textAlign: "center"
};

const formatGroupLabel = (data, innerRef, innerProps) => (
  <div {...innerProps} ref={innerRef} style={groupStyles}>
    <span>{data.label}</span>
    <span style={groupBadgeStyles}>{data.options.length}</span>
  </div>
);

export class CrmEditVehicleModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
      colorOptions: ColorOptions,
      selectedOption: null,
      year: "",
      make: "",
      modal: "",
      typeSelected: { value: "sedan", label: "Sedan", color: "#FF8B00", icons: "sedan.svg" },
      colorSelected: "",
      miles: "",
      licensePlate: "",
      unit: "",
      vin: "",
      subModal: "",
      engineSize: "",
      productionDate: "",
      transmissionSelected: "automatic",
      drivetrainSelected: "2x4",
      notes: "",
      errors: {},
      prodMonthError: "",
      prodYearError: "",
      isLoading: false
    };
  }

  componentDidUpdate(prevProps) {
    const { vehicleData } = this.props;
    if (prevProps.vehicleData._id !== vehicleData._id) {
      this.setState({
        year: this.props.vehicleData.year,
        make: this.props.vehicleData.make,
        modal: this.props.vehicleData.modal,
        typeSelected: this.props.vehicleData.type ? this.props.vehicleData.type : { value: "sedan", label: "Sedan", color: "#FF8B00", icons: "sedan.svg" },
        colorSelected: this.props.vehicleData.color,
        miles: this.props.vehicleData.miles,
        licensePlate: this.props.vehicleData.licensePlate,
        unit: this.props.vehicleData.unit,
        vin: this.props.vehicleData.vin,
        subModal: this.props.vehicleData.subModal,
        engineSize: this.props.vehicleData.engineSize,
        productionDate: this.props.vehicleData.productionDate,
        transmissionSelected: this.props.vehicleData.transmission,
        drivetrainSelected: this.props.vehicleData.drivetrain,
        notes: this.props.vehicleData.notes
      });
    }
  }

  _onInputChange = e => {
    const { target } = e;
    const { name, value } = target;
    if ((name === "year" || name === "miles") && isNaN(value)) {
      return;
    }
    if (name === "productionDate") {
      const splitedDate = value.split("/")
      var d = new Date();
      var n = d.getFullYear();
      if (parseInt(splitedDate[0]) > 12 && splitedDate[0]) {
        this.setState({
          prodMonthError: "Enter valid month."
        })
      }
      else if (parseInt(splitedDate[1]) >= n && splitedDate[1]) {
        this.setState({
          prodYearError: "Production year should be less than current year",
          prodMonthError: null
        })
      }
      else {
        this.setState({
          prodYearError: null,
          prodMonthError: null
        })
      }
    }
    this.setState({
      [name]: value,
      errors: {
        ...this.state.errors,
        [name]: null
      }
    });
  };

  handleColor = selectedColor => {
    this.setState({ colorSelected: selectedColor });
  };

  handleType = selectedType => {
    this.setState({
      typeSelected: selectedType
    });
  };

  handleExpandForm = () => {
    this.setState({
      expandForm: !this.state.expandForm
    });
  };
  handleChange = selectedOption => {
    this.setState({ selectedOption });
  };
  handleSelectedChange = selectedOption => {
    const { target } = selectedOption;
    const { name, value } = target;
    this.setState({
      [name]: value
    });
  };

  yearValidation = async year => {
    const text = /^[0-9]+$/;
    let errors = { ...this.state.errors };

    if (year) {
      if (year.length === 4) {
        if (year !== "" && !text.test(parseInt(year))) {
          errors["year"] = "Please Enter Numeric Values Only";
          this.setState({ errors });
          return false;
        }

        if (year.length !== 4) {
          errors["year"] = "Year is not proper. Please check";
          this.setState({ errors });
          return false;
        }

        const current_year = new Date().getFullYear();
        if (year <= current_year - 101 || year > current_year) {
          errors["year"] = `Year should be in range ${current_year -
            101} to ${new Date().getFullYear()}`;
          this.setState({ errors });
          return false;
        }
        errors["year"] = "";
        this.setState({ errors });
        return true;
      } else {
        errors["year"] = "Year is not proper. Please check";
        this.setState({ errors });
        return false;
      }
    } else {
      errors["year"] = "Please enter year.";
      this.setState({ errors });
      return false;
    }
  };

  async removeAllState() {
    this.setState({
      expandForm: false,
      colorOptions: ColorOptions,
      selectedOption: null,
      year: "",
      make: "",
      modal: "",
      typeSelected: { value: "sedan", label: "Sedan", color: "#FF8B00", icons: "sedan.svg" },
      colorSelected: "",
      miles: "",
      licensePlate: "",
      unit: "",
      vin: "",
      subModal: "",
      engineSize: "",
      productionDate: "",
      transmissionSelected: "automatic",
      drivetrainSelected: "2x4",
      notes: "",
      errors: {}
    });
  }

  updateVehicleFun = async () => {
    let data = {
      year: this.state.year,
      make: this.state.make,
      modal: this.state.modal,
      type: this.state.typeSelected ? this.state.typeSelected : { value: "sedan", label: "Sedan", color: "#FF8B00", icons: "sedan.svg" },
      color: this.state.colorSelected,
      miles: this.state.miles,
      licensePlate: this.state.licensePlate,
      unit: this.state.unit,
      vin: this.state.vin,
      subModal: this.state.subModal,
      engineSize: this.state.engineSize,
      productionDate: this.state.productionDate,
      transmission: this.state.transmissionSelected,
      drivetrain: this.state.drivetrainSelected,
      notes: this.state.notes
    };

    let validationData = {
      year: this.state.year,
      make: this.state.make,
      modal: this.state.modal
    };

    if (this.state.miles !== "") {
      validationData.miles = this.state.miles;
    }

    const { isValid, errors } = Validator(
      validationData,
      VehicleValidations,
      VehicleValidationMessage
    );

    try {
      const yearValidation = await this.yearValidation(this.state.year);

      if (!isValid || !yearValidation || this.state.prodMonthError || this.state.prodYearError) {
        this.setState(
          {
            errors: errors,
            isLoading: false
          },
          async () => {
            await this.yearValidation(this.state.year);
          }
        );
        return;
      }
      this.props.submitUpdateVehicleFun(data);
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  };

  render() {
    const { vehicleEditModalOpen, handleEditVehicleModal, vehicleData } = this.props;
    const {
      expandForm,
      transmissionSelected,
      drivetrainSelected,
      typeSelected,
      colorSelected,
      errors,
      miles,
      subModal,
      engineSize,
      productionDate,
      prodMonthError,
      prodYearError,
      notes
    } = this.state;
    console.log("##################", drivetrainSelected);
    return (
      <>
        <Modal
          isOpen={vehicleEditModalOpen}
          toggle={handleEditVehicleModal}
          className="customer-modal custom-form-modal custom-modal-lg"
        >
          <ModalHeader toggle={handleEditVehicleModal}>
            Update Vehicle
            <LastUpdated updatedAt={vehicleData.updatedAt} />
          </ModalHeader>
          <ModalBody>
            <Row className="justify-content-center">
              <Col md="6">
                <FormGroup>
                  <Label htmlFor="name" className="customer-modal-text-style">
                    Year <span className={"asteric"}>*</span>
                  </Label>
                  <div className={"input-block"}>
                    <Input
                      type="text"
                      placeholder="20XX"
                      id="year"
                      name="year"
                      onChange={this._onInputChange}
                      value={this.state.year}
                      invalid={errors.year}
                    />
                    <FormFeedback>
                      {errors.hasOwnProperty("year") ? errors.year : null}
                    </FormFeedback>
                  </div>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label htmlFor="name" className="customer-modal-text-style">
                    Make <span className={"asteric"}>*</span>
                  </Label>
                  <div className={"input-block"}>
                    <Input
                      type="text"
                      placeholder="Honda"
                      name="make"
                      onChange={this._onInputChange}
                      value={this.state.make}
                      maxLength="25"
                      invalid={errors.make}
                    />
                    {/* {!make && errors.make ? (
                    <p className="text-danger">{errors.make}</p>
                  ) : null} */}
                    <FormFeedback>
                      {errors.make ? errors.make : null}
                    </FormFeedback>
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col md="6">
                <FormGroup>
                  <Label htmlFor="name" className="customer-modal-text-style">
                    Model <span className={"asteric"}>*</span>
                  </Label>
                  <div className={"input-block"}>
                    <Input
                      type="text"
                      className="customer-modal-text-style"
                      id="type"
                      placeholder="Accord OR Q3 Or WR..."
                      name="modal"
                      onChange={this._onInputChange}
                      value={this.state.modal}
                      maxLength="25"
                      invalid={errors.modal}
                    />
                    {/* {!modal && errors.modal ? (
                    <p className="text-danger">{errors.modal}</p>
                  ) : null} */}
                    <FormFeedback>
                      {errors.modal ? errors.modal : null}
                    </FormFeedback>
                  </div>
                  {/* <div className="error-tool-tip">this field is </div> */}
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label htmlFor="name" className="customer-modal-text-style">
                    Type
                  </Label>
                  <Select
                    defaultValue={typeSelected}
                    options={groupedOptions}
                    formatGroupLabel={formatGroupLabel}
                    className="w-100 form-select"
                    onChange={this.handleType}
                    value={typeSelected}
                    classNamePrefix={"form-select-theme"}
                  />
                  {!typeSelected && errors.type ? (
                    <p className="text-danger">{errors.type}</p>
                  ) : null}
                </FormGroup>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col md="6">
                <FormGroup>
                  <Label htmlFor="name" className="customer-modal-text-style">
                    Miles
                  </Label>
                  <div className={"input-block"}>
                    <Input
                      type="text"
                      placeholder="100,00"
                      name="miles"
                      onChange={this._onInputChange}
                      value={this.state.miles}
                      maxLength={15}
                    />
                    {!miles && errors.miles ? (
                      <p className="text-danger">{errors.miles}</p>
                    ) : null}
                  </div>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label htmlFor="name" className="customer-modal-text-style">
                    Color
                  </Label>
                  <Select
                    value={colorSelected}
                    onChange={this.handleColor}
                    options={this.state.colorOptions}
                    className="w-100 form-select"
                    classNamePrefix={"form-select-theme"}
                    placeholder={"Pick a color"}
                    isClearable={true}
                    components={{ Option: CustomOption }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col md="6">
                <FormGroup>
                  <Label htmlFor="name" className="customer-modal-text-style">
                    Licence Plate
                  </Label>
                  <Input
                    type="text"
                    placeholder="AUM 100"
                    name="licensePlate"
                    onChange={this._onInputChange}
                    value={this.state.licensePlate}
                    maxLength={15}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label htmlFor="name" className="customer-modal-text-style">
                    Unit #
                  </Label>
                  <Input
                    type="text"
                    placeholder="BA1234"
                    name="unit"
                    onChange={this._onInputChange}
                    value={this.state.unit}
                    maxLength={15}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row className="">
              <Col md="6">
                <FormGroup>
                  <Label htmlFor="name" className="customer-modal-text-style">
                    VIN
                  </Label>
                  <Input
                    type="text"
                    placeholder="19UAYF3158T0000"
                    name="vin"
                    onChange={this._onInputChange}
                    value={this.state.vin}
                    maxLength={100}
                  />
                </FormGroup>
              </Col>
              {expandForm ? (
                <>
                  <Col md="6">
                    <FormGroup>
                      <Label
                        htmlFor="name"
                        className="customer-modal-text-style"
                      >
                        Sub Model
                      </Label>
                      <div className={"input-block"}>
                        <Input
                          type="text"
                          placeholder="Sub Model"
                          name="subModal"
                          onChange={this._onInputChange}
                          value={this.state.subModal}
                        />
                        {!subModal && errors.subModal ? (
                          <p className="text-danger">{errors.subModal}</p>
                        ) : null}
                      </div>
                    </FormGroup>
                  </Col>
                </>
              ) : (
                  ""
                )}
            </Row>
            {/* <Row className="justify-content-center">
              <Col md="12 text-center">
                {!expandForm ? (
                  <span
                    onClick={this.handleExpandForm}
                    className="customer-anchor-text customer-click-btn"
                  >
                    Show More
                  </span>
                ) : (
                  ""
                )}
              </Col>
            </Row> */}
            {/* {expandForm ? (
              <> */}
            <Row className="justify-content-center">
              <Col md="6">
                <FormGroup>
                  <Label
                    htmlFor="name"
                    className="customer-modal-text-style"
                  >
                    Engine Size
                      </Label>
                  <div className={"input-block"}>
                    <Input
                      type="text"
                      name="engineSize"
                      onChange={this._onInputChange}
                      placeholder="Engine Size"
                      id="rate"
                      value={this.state.engineSize}
                    />
                    {!engineSize && errors.engineSize ? (
                      <p className="text-danger">{errors.engineSize}</p>
                    ) : null}
                  </div>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label
                    htmlFor="name"
                    className="customer-modal-text-style"
                  >
                    Production Date
                      </Label>
                  <div className={"input-block"}>
                    <MaskedInput
                      name="productionDate"
                      mask="11/1111"
                      placeholder="MM/YYYY"
                      onChange={this._onInputChange}
                      value={this.state.productionDate}
                      className={classnames("form-control", {
                        "is-invalid":
                          (prodMonthError || prodYearError) &&
                          productionDate
                      })}
                    />
                    <FormFeedback>
                      {prodYearError ? prodYearError : null}
                    </FormFeedback>
                    <FormFeedback>
                      {prodMonthError ? prodMonthError : null}
                    </FormFeedback>
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col md="6">
                <FormGroup>
                  <Label
                    htmlFor="name"
                    className="customer-modal-text-style"
                  >
                    Transmission
                      </Label>
                  <Input
                    type="select"
                    className=""
                    onChange={this.handleSelectedChange}
                    name="transmission"
                    id="matrixId"
                  >
                    <option value={""}>Select</option>
                    {Transmission.length
                      ? Transmission.map((item, index) => {
                        return (
                          <option
                            selected={item.key === transmissionSelected}
                            value={item.key}
                            key={index}
                          >
                            {item.text}
                          </option>
                        );
                      })
                      : null}
                  </Input>
                  {!transmissionSelected && errors.transmission ? (
                    <p className="text-danger">{errors.transmission}</p>
                  ) : null}
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label
                    htmlFor="name"
                    className="customer-modal-text-style"
                  >
                    Drivetrain
                      </Label>
                  <Input
                    type="select"
                    className=""
                    onChange={this.handleSelectedChange}
                    name="drivetrainSelected"
                    id="matrixId"
                  >
                    <option value={""}>Select</option>
                    {Drivetrain.length
                      ? Drivetrain.map((item, index) => {
                        return (
                          <option
                            selected={item.key === drivetrainSelected}
                            value={item.key}
                            key={index}
                          >
                            {item.text}
                          </option>
                        );
                      })
                      : null}
                  </Input>
                  {!drivetrainSelected && errors.drivetrain ? (
                    <p className="text-danger">{errors.drivetrain}</p>
                  ) : null}
                </FormGroup>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col md="12">
                <FormGroup>
                  <Label
                    htmlFor="name"
                    className="customer-modal-text-style"
                  >
                    Notes
                      </Label>
                  <Input
                    name="notes"
                    type="textarea"
                    placeholder="Enter a note..."
                    id="name"
                    maxLength={"100"}
                    value={this.state.notes}
                    onChange={this._onInputChange}
                  />
                  {!notes && errors.notes ? (
                    <p className="text-danger">{errors.notes}</p>
                  ) : null}
                </FormGroup>
              </Col>
            </Row>
            {/* <Row className="justify-content-center">
                  <Col md="12 text-center">
                    {expandForm ? (
                      <span
                        onClick={this.handleExpandForm}
                        className="customer-anchor-text customer-click-btn"
                      >
                        Show Less
                      </span>
                    ) : (
                      ""
                    )}
                  </Col>
                </Row> */}
            {/* </>
            ) : (
              ""
            )} */}
          </ModalBody>
          <ModalFooter>
            <div className="required-fields">*Fields are Required.</div>
            <Button color="primary" onClick={this.updateVehicleFun}>
              Update Vehicle
            </Button>{" "}
            <Button color="secondary" onClick={handleEditVehicleModal}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  }
}
