import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getInventoryPartsList,
  deletePartFromInventory,
  updatePartFromInventory,
  getMatrixList
} from "../../../actions";
import {
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  InputGroup,
  Input,
  UncontrolledTooltip,
  Table,
  Badge,
  Button
} from "reactstrap";
import { Async } from "react-select";
import * as qs from "query-string";
import Loader from "../../../containers/Loader/Loader";
import { AppConfig } from "../../../config/AppConfig";
import PaginationHelper from "../../../helpers/Pagination";
import { logger } from "../../../helpers/Logger";
import { ConfirmBox } from "../../../helpers/SweetAlert";
import CrmInventoryPart from "../../common/CrmInventoryPart";
import moment from "moment";
import NoDataFound from "../../common/NoFound";

class Parts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vendorId: "",
      search: "",
      status: "",
      sort: "",
      filterApplied: false,
      limit: AppConfig.ITEMS_PER_PAGE,
      page: 1,
      vendorInput: "",
      selectedParts: [],
      part: {}
    };
  }
  componentDidMount() {
    const { limit } = this.state;
    let query = {
      limit
    };
    const queryParams = qs.parse(this.props.location.search);
    const { page, search, status, sort, vendorId } = queryParams;
    let filterApplied = false;
    if (search || status || sort || vendorId) {
      filterApplied = true;
    }
    this.setState({
      page: page && page > 0 ? parseInt(page) : 1,
      search: search || "",
      status: status || "",
      sort: sort || "",
      vendorId: vendorId ? qs.parse(vendorId) : "",
      filterApplied
    });
    if (vendorId) {
      query.vendorId = qs.parse(vendorId).value;
    }
    this.props.getParts({ ...queryParams, ...query });
    this.props.getPriceMatrix();
  }
  componentDidUpdate({ location }) {
    const { location: currentLocation } = this.props;
    const { search } = location;
    const { search: currentSearch } = currentLocation;
    if (search !== currentSearch) {
      let query = qs.parse(currentSearch);
      this.setState({ ...query, page: parseInt(query.page) });
      if (query.vendorId) {
        const vendorId = qs.parse(query.vendorId);
        this.setState({
          vendorId
        });
        query.vendorId = vendorId.value;
      }
      this.props.getParts(query);
    }
  }
  onPageChange = page => {
    const { location } = this.props;
    const { pathname } = location;
    const { search, status, sort, vendorId } = this.state;
    const query = {
      page,
      search,
      status,
      sort,
      vendorId: vendorId ? qs.stringify(vendorId) : undefined
    };
    this.props.redirectTo(`${pathname}?${qs.stringify(query)}`);
  };
  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };
  onSearch = e => {
    e.preventDefault();
    const { location } = this.props;
    const { pathname } = location;
    const { search, status, sort, vendorId } = this.state;
    const query = {
      page: 1,
      search,
      status,
      sort,
      vendorId: vendorId ? qs.stringify(vendorId) : undefined,
      vendorInput: ""
    };
    this.setState({
      filterApplied: true,
      page: 1
    });
    this.props.redirectTo(`${pathname}?${qs.stringify(query)}`);
  };
  onReset = e => {
    e.preventDefault();
    this.setState({
      filterApplied: false,
      vendorId: "",
      sort: "",
      search: "",
      status: "",
      page: 1
    });
    const { location } = this.props;
    const { pathname } = location;
    this.props.redirectTo(`${pathname}`);
  };
  loadOptions = (input, callback) => {
    this.setState({ vendorInput: input.length > 1 ? input : null });
    this.props.getInventoryPartsVendors({ input, callback });
  };
  onEdit = part => {
    const { modelInfoReducer, modelOperate } = this.props;
    const { modelDetails } = modelInfoReducer;
    logger(this.props);
    const { partEditModalOpen } = modelDetails;
    this.setState({ part }, () => {
      modelOperate({
        partEditModalOpen: !partEditModalOpen
      });
    });
  };
  onDelete = async isMultiple => {
    const { value } = await ConfirmBox({
      text: isMultiple
        ? "Do you want to delete selected part(s)?"
        : "Do you want to delete this parts?"
    });
    if (!value) {
      this.setState({
        selectedParts: []
      });
      return;
    }
    this.props.deletePart({
      parts: this.state.selectedParts,
      query: this.getQueryParams()
    });
  };
  getQueryParams = () => {
    let query = qs.parse(this.props.location.search);
    if (query.vendorId) {
      query.vendorId = qs.parse(query.vendorId).value;
    }
    return query;
  };
  updatePartDetails = data => {
    const query = this.getQueryParams();
    this.props.updateInventoryPart({ data, query });
  };
  setVendorSearch = (vendorData) => {
    this.props.history.push(`/inventory/vendors?page=1&search=${vendorData.name}`);
  }

  render() {
    const {
      vendorId,
      search,
      status,
      sort,
      filterApplied,
      page,
      vendorInput,
      part: partDetails
    } = this.state;
    const {
      inventoryPartsData,
      getInventoryPartsVendors,
      modelInfoReducer,
      onAddClick,
      getPriceMatrix,
      matrixListReducer
    } = this.props;
    const { modelDetails } = modelInfoReducer;
    logger(this.props);
    const { partEditModalOpen } = modelDetails;
    const { isLoading, parts, totalParts } = inventoryPartsData;
    return (
      <>
        <div className={"filter-block"}>
          <Form onSubmit={this.onSearch}>
            <Row>
              <Col lg={"3"} md={"3"} className="mb-0">
                <FormGroup className="mb-0">
                  <InputGroup className="mb-2">
                    <Input
                      type="text"
                      name="search"
                      onChange={this.handleChange}
                      className="form-control"
                      aria-describedby="searchUser"
                      placeholder="Search by part description, note, part number and location"
                      value={search}
                    />
                  </InputGroup>
                </FormGroup>
              </Col>
              <Col lg={"2"} md={"2"} className="mb-0">
                <FormGroup className="mb-0">
                  <Input
                    type="select"
                    name="status"
                    id="exampleSelect"
                    onChange={this.handleChange}
                    value={status}
                  >
                    <option className="form-control" value={""}>
                      Filter by
                    </option>
                    <option value={"critical"}>Critical Quantity</option>
                    <option value={"ncritical"}>Non-Critical Quantity</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col lg={"2"} md={"2"} className="mb-0">
                <FormGroup className="mb-0">
                  <Input
                    type="select"
                    name="sort"
                    id="SortFilter"
                    onChange={this.handleChange}
                    value={sort}
                  >
                    <option className="form-control" value={""}>
                      Sort By
                    </option>
                    <option value={"qltoh"}>Quantity(Low to High)</option>
                    <option value={"qhtol"}>Quantity(High to High)</option>
                    <option value={"cltoh"}>Cost(Low to High)</option>
                    <option value={"chtol"}>Cost(High to High)</option>
                    <option value={"rpltoh"}>Retail Price(Low to High)</option>
                    <option value={"rphtol"}>Retail Price(High to High)</option>
                    <option value={"cdltoh"}>Last created</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col lg={"5"} md={"5"} className="mb-0">
                <Row>
                  <Col md={"6"}>
                    <FormGroup className="mb-0">
                      <Async
                        placeholder={"Type vendor name"}
                        loadOptions={this.loadOptions}
                        value={vendorId}
                        onChange={e => {
                          this.setState({
                            vendorId: e
                          });
                        }}
                        isClearable={true}
                        noOptionsMessage={() =>
                          vendorInput ? "No vendor found" : "Type vendor name"
                        }
                      />
                    </FormGroup>
                  </Col>
                  <Col lg={"6"} md={"6"} className="mb-0">
                    <div className="filter-btn-wrap">
                      <Label className="height17 label" />
                      <div className="form-group mb-0">
                        <span className="mr-2">
                          <Button
                            type="submit"
                            className="btn btn-theme-transparent"
                            id="Tooltip-1"
                          >
                            <i className="icons cui-magnifying-glass" />
                          </Button>
                          <UncontrolledTooltip target="Tooltip-1">
                            Search
                          </UncontrolledTooltip>
                        </span>
                        <span className="">
                          <Button
                            className="btn btn-theme-transparent"
                            id="Tooltip-2"
                            onClick={this.onReset}
                          >
                            <i className="icon-refresh icons" />
                          </Button>
                          <UncontrolledTooltip target={"Tooltip-2"}>
                            Reset all filters
                          </UncontrolledTooltip>
                        </span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
        </div>
        <Table responsive>
          <thead>
            <tr>
              <th width={"60px"}>S No.</th>
              <th width={"200"}>
                <i className="fa fa-gear" /> Part Description
              </th>
              {/* <th>Note</th>
              <th>Part number</th> */}
              <th width={"170"}>
                <i className="fa fa-id-badge" /> Vendor
              </th>
              <th width={"150"}>
                <i className="fa fa-bitbucket" /> Bin/Location
              </th>
              <th width={"200"}>
                <i className="fa fa-dollar" /> Price
              </th>
              {/* <th>Retail Price</th> */}
              <th width={"120"}>
                <i className="fa fa-shopping-basket" /> Quantity
              </th>
              <th width={"120"}>
                <i className="fa fa-clock-o" /> Created
              </th>
              <th className={"text-center"} width={"140"}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className={"text-center"} colSpan={12}>
                  <Loader />
                </td>
              </tr>
            ) : parts && parts.length ? (
              parts.map((part, index) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className={"text-capitalize"}>
                      <div className={"font-weight-bold"}>
                        {part.description || "-"}
                      </div>
                      {part.partNumber ? (
                        <div className={"modal-info"}>
                          Part No. : <Badge>{part.partNumber}</Badge>
                        </div>
                      ) : null}
                      {part.note ? (
                        <span className={"part-note"}>part.note</span>
                      ) : (
                        " "
                      )}
                    </td>
                    <td className={"font-weight-bold"} onClick={part.vendorId ? () => this.setVendorSearch(part.vendorId) : null}>
                      {part.vendorId ? part.vendorId.name || "-" : "-"}
                    </td>
                    <td>{part.location || "-"}</td>
                    <td>
                      {part.cost ? (
                        <div className="modal-info">
                          Cost -{" "}
                          <span className={"dollar-price"}>
                            <i className="fa fa-dollar dollar-icon" />
                            {part.cost || " "}
                          </span>
                        </div>
                      ) : null}
                      {part.retailPrice ? (
                        <div className="modal-info">
                          Retail -{" "}
                          <span className={"dollar-price"}>
                            <i className="fa fa-dollar dollar-icon" />
                            {part.retailPrice || " "}
                          </span>
                        </div>
                      ) : null}
                    </td>
                    <td className={part.quantity > part.criticalQuantity ? "pl-4" :null}>
                      <span className={"qty-value"}>{part.quantity || 0}&nbsp;</span>
                      {part.quantity <= part.criticalQuantity ? (
                        <Badge color={"warning"}>Reorder</Badge>
                      ) : null}
                      
                    </td>
                    <td>
                      <div>{moment(part.createdAt).format("MMM Do YYYY")}</div>
                      <div>{moment(part.createdAt).format("h:mm a")}</div>
                    </td>
                    <td className={"text-center"}>
                      <Button
                        size={"sm"}
                        onClick={() => this.onEdit(part)}
                        id={`edit-${part._id}`}
                        className={"btn-theme-transparent"}
                      >
                        <i className={"icons cui-pencil"} />
                      </Button>{" "}
                      <UncontrolledTooltip target={`edit-${part._id}`}>
                        Edit 
                      </UncontrolledTooltip>
                      &nbsp;
                      <Button
                        size={"sm"}
                        onClick={() =>
                          this.setState(
                            {
                              selectedParts: [part._id]
                            },
                            () => {
                              this.onDelete();
                            }
                          )
                        }
                        id={`delete-${part._id}`}
                        className={"btn-theme-transparent"}
                      >
                        <i className={"icons cui-trash"} />
                      </Button>
                      <UncontrolledTooltip target={`delete-${part._id}`}>
                        Delete
                      </UncontrolledTooltip>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className={"text-center"} colSpan={12}>
                  {filterApplied ? (
                    <NoDataFound
                      message={"No Part details found related to your search"}
                      noResult
                    />
                  ) : (
                    <NoDataFound
                      showAddButton
                      message={"Currently there are no Part details added."}
                      onAddClick={onAddClick}
                    />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        {totalParts && !isLoading ? (
          <PaginationHelper
            totalRecords={totalParts}
            onPageChanged={page => {
              this.onPageChange(page);
            }}
            currentPage={page}
            pageLimit={AppConfig.ITEMS_PER_PAGE}
          />
        ) : null}
        <CrmInventoryPart
          isOpen={partEditModalOpen}
          toggle={() => this.onEdit({})}
          inventoryPartsData={inventoryPartsData}
          getInventoryPartsVendors={getInventoryPartsVendors}
          updateInventoryPart={this.updatePartDetails}
          partDetails={partDetails}
          getPriceMatrix={getPriceMatrix}
          matrixList={matrixListReducer.matrixList}
          isEditMode={true}
        />
      </>
    );
  }
}
const mapStateToProps = state => ({
  inventoryPartsData: state.inventoryPartsReducers,
  matrixListReducer: state.matrixListReducer
});
const mapDispatchToProps = dispatch => ({
  getParts: params => {
    dispatch(getInventoryPartsList(params));
  },
  deletePart: data => {
    dispatch(deletePartFromInventory(data));
  },
  updateInventoryPart: data => {
    dispatch(updatePartFromInventory(data));
  },
  getPriceMatrix: data => {
    dispatch(getMatrixList(data));
  }
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Parts);