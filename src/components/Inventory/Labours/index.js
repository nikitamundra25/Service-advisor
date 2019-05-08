import React, { Component } from "react";
import {
  Table,
  Button,
  Form,
  FormGroup,
  Row,
  Col,
  Label,
  InputGroup,
  Input,
  UncontrolledTooltip,
  Badge
} from "reactstrap";

import Loader from "../../../containers/Loader/Loader";
import { connect } from "react-redux";
import {
  labourEditRequest, labourListRequest, getRateStandardListRequest, deleteLabour,
  setRateStandardListStart, rateAddRequest
} from "../../../actions";
import { CrmLabourModal } from '../../common/Labours/CrmLabourModal'
import PaginationHelper from "../../../helpers/Pagination";
import { ConfirmBox } from "../../../helpers/SweetAlert";
import * as qs from "query-string";
import { AppConfig } from "../../../config/AppConfig";
import { isEqual } from "../../../helpers/Object";
import NoDataFound from "../../common/NoFound"
class Labours extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openFleetModal: false,
      labourListdata: {},
      error: {},
      isLoading: false,
      filterApplied: false,
      search: "",
      sort: "",
      page: 1,
      labour: {},
      expandText: false,
      selectedLabours: []
    };
  }

  componentDidMount() {
    this.props.getStdList();
    const query = qs.parse(this.props.location.search);
    const { location } = this.props;
    const lSearch = location.search;
    const { page, search, sort } = qs.parse(lSearch);
    this.props.getlabour({ ...query, page: query.page || 1 });
    if (location.search !== '') {
      this.setState({
        filterApplied: true,
        page: parseInt(page) || 1,
        sort: sort || "",
        search: search || ""
      })
    }
    else {
      this.setState({
        page: parseInt(page) || 1,
        sort: sort || "",
        search: search || ""
      });
    }
  }

  componentDidUpdate({ labourReducer, location }) {
    if (
      this.props.labourReducer.labourData.isSuccess !==
      labourReducer.labourData.isSuccess
    ) {
      if (this.props.labourReducer.labourData.isSuccess) {
        const query = qs.parse(this.props.location.search);
        this.props.getlabour({ ...query, page: query.page || 1 });
      }
    }
    if (
      this.props.labourReducer.labourData.isEditSuccess !==
      labourReducer.labourData.isEditSuccess
    ) {
      if (this.props.labourReducer.labourData.isEditSuccess) {
        const query = qs.parse(this.props.location.search);
        this.props.getlabour({ ...query, page: query.page || 1 });
      }
    }
    const prevQuery = qs.parse(location.search);
    const currQuery = qs.parse(this.props.location.search);
    if (!isEqual(prevQuery, currQuery)) {
      this.props.getlabour({ ...currQuery, page: currQuery.page || 1 });
    }
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };
  onSearch = e => {
    e.preventDefault();
    this.setState({
      page: 1,
      selectedLabours: []
    });
    const { search, sort } = this.state;
    let param = {};
    param.page = 1;
    let hasFilter = false;
    if (search) {
      param.search = search.trim(" ");
      hasFilter = true;
    }
    if (sort) {
      param.sort = sort;
    }
    this.setState({ filterApplied: hasFilter });
    const { location } = this.props;
    const { pathname } = location;
    this.props.redirectTo([pathname, qs.stringify(param)].join("?"))
  };

  onReset = e => {
    e.preventDefault();

    this.setState({
      page: 1,
      search: "",
      sort: "",
      labour: {},
      selectedLabours: [],
      filterApplied: false
    });
    const { location } = this.props;
    const { pathname } = location;
    this.props.redirectTo([pathname, qs.stringify('')].join("?"))
  };
  editLabour = data => {
    this.setState({ labour: data }, () => {
      this.props.modelOperate({
        tireEditModalOpen: true
      });
    });
  };

  updateLabour = data => {
    try {
      this.props.updateLabour(data);
      this.setState({
        tireEditModalOpen: !this.state.tireEditModalOpen,
      });
    } catch (error) {
      Loader(error)
    }
  }
  onDelete = async (isMultiple = false) => {
    const { value } = await ConfirmBox({
      text: isMultiple
        ? "Do you want to delete selected labour(s)?"
        : "Do you want to delete this labour?"
    });
    if (!value) {
      this.setState({
        selectedLabours: []
      });
      return;
    }
    const { location } = this.props;
    const { search } = location;
    const query = qs.parse(search);
    const data = {
      ...query,
      labourId: this.state.selectedLabours,
    };
    this.props.deleteLabour(data);
    this.setState({ selectedLabours: [] });
  };
  onTypeHeadStdFun = data => {
    this.props.getStdList(data);
  };

  setDefaultRate = value => {
    this.props.setLabourRateDefault(value);
  };
  addRate = data => {
    try {
      this.props.addRate(data);
    } catch (error) {
      Loader(error)
    }
  }
  onPageChange = (page) => {
    this.setState({ page });
    const { location } = this.props;
    const { search, pathname } = location;
    const query = qs.parse(search);
    this.props.redirectTo(
      [pathname, qs.stringify({ ...query, page })].join("?")
    );
  }
  render() {
    const {
      search,
      sort,
      page,
      filterApplied,
      expandText } = this.state;
    const { labourReducer, profileInfoReducer, rateStandardListReducer, modelInfoReducer, modelOperate, onAddClick } = this.props;
    const { modelDetails } = modelInfoReducer;
    const { tireEditModalOpen, rateAddModalOpen } = modelDetails;
    const { isLoading, labourData } = labourReducer;
    return (
      <>
        <div className={"filter-block"}>
          <Form onSubmit={this.onSearch}>
            <Row>
              <Col lg={"4"} md={"4"} className="mb-0">
                <FormGroup className="mb-0">
                  {/* <Label className="label">Search</Label> */}
                  <InputGroup className="mb-2">
                    <input
                      type="text"
                      name="search"
                      onChange={this.handleChange}
                      className="form-control"
                      value={search}
                      aria-describedby="searchUser"
                      placeholder="Search by Labor description"
                    />
                  </InputGroup>
                </FormGroup>
              </Col>
              <Col lg={"2"} md={"2"} className="mb-0">
                <FormGroup className="mb-0">
                  {/* <Label for="SortFilter" className="label">
                    Sort By
                  </Label> */}
                  <Input
                    type="select"
                    name="sort"
                    id="SortFilter"
                    onChange={this.handleChange}
                    value={sort}
                  >
                    <option className="form-control" value={""}>
                      Sort
                    </option>
                    <option value={"pasc"}>Price(Low to High)</option>
                    <option value={"pdesc"}>Price(High to Low)</option>
                    <option value={"diasc"}>Discount(Low to High)</option>
                    <option value={"didesc"}>Discount(High to Low)</option>
                    <option value={"createddesc"}>Last Created</option>
                    <option value={"nasc"}>Labor discription A-Z</option>
                    <option value={"ndesc"}>Labor discription Z-A</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col lg={"2"} md={"2"} className="mb-0">
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
                        type="button"
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
          </Form>
        </div>
        <Table responsive >
          <thead>
            <tr>
              <th width='90px'>S No.</th>
              <th width={"250"}>Labor Description</th>
              <th width={"350"}>Note</th>
              <th>Rate</th>
              <th>Hours</th>
              {/* <th>Price</th> */}
              <th>Discount</th>
              <th width={"90"} className={"text-center"}>Action</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading ? (
              labourData && labourData.data && labourData.data.length ? (
                labourData.data.map((data, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <label htmlFor={data._id}>
                          {(page - 1) * AppConfig.ITEMS_PER_PAGE + index + 1}.
                        </label>
                      </td>
                      <td><b>{data.discription || "-"}</b></td>
                      {
                        !expandText ?
                          <td className={"pr-4"}>
                            <div className={"word-break"}>
                              {data.notes ? data.notes.substring(0, 70) : "-"}{" "}
                              <span className={"read-more-text"} onClick={() => this.setState({
                                expandText: true
                              })}>
                                <Badge color={"warning"}>
                                  {data.notes && data.notes.length >= 70 ? "read more...." : null}
                                </Badge>
                              </span>
                            </div>
                          </td> :
                          <td className={"pr-4"}>
                            
                            <div className={"word-break"}>
                              {data.notes ? data.notes : "-"}{" "}
                              <span className={"read-more-text"} onClick={() => this.setState({
                                expandText: false
                              })}>
                                <Badge color={"warning"}>
                                  {data.notes && data.notes.length >= 70 ? "show less" : null}
                                </Badge>
                              </span>
                            </div>
                          </td>
                      }
                      <td>
                        <div className="">
                          {(data.rate && data.rate.name) ? data.rate.name : "-"} -
                          {(data.rate && data.rate.hourlyRate) ? <span className={"dollar-price"}>
                            <i class="fa fa-dollar dollar-icon"></i>
                            {data.rate.hourlyRate}
                          </span> : "-"}
                        </div>
                      </td>
                      <td>{(data.hours) ? data.hours + ' Hrs' : "-"}</td>
                      {/* <td>{(data.rate && data.rate.hourlyRate) ? '$' + data.rate.hourlyRate : "-"}</td> */}
                      <td>{data.discount || "-"}</td>
                      <td className={"text-center"}>
                        <span className="mr-2">
                          <Button
                            size={"sm"}
                            onClick={() => this.editLabour(data)}
                            className={"btn btn-theme-transparent"}
                            id={"ToolTip-3"}
                          >
                            <i className={"icons cui-pencil"} />
                          </Button>
                          <UncontrolledTooltip target={"ToolTip-3"}>
                            Edit
                        </UncontrolledTooltip>
                        </span>
                        <span>
                          <Button
                            size={"sm"}
                            onClick={() =>
                              this.setState(
                                {
                                  selectedLabours: [data._id]
                                },
                                () => {
                                  this.onDelete();
                                })
                            }
                            className={"btn btn-theme-transparent"}
                            id={"ToolTip-4"}
                          >
                            <i className={"icons cui-trash"}></i>
                          </Button>
                          <UncontrolledTooltip target={"ToolTip-4"}>
                            Delete
                        </UncontrolledTooltip>
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                  <tr>
                    <td className={"text-center"} colSpan={8}>
                      {filterApplied ? <NoDataFound message={"No Labor details found related to your search"} noResult={true} /> :
                        <NoDataFound showAddButton message={"Currently there are no Labor details added."} onAddClick={onAddClick} noResult={false} />
                      }
                    </td>
                  </tr>
                )
            ) : (
                <tr>
                  <td className={"text-center"} colSpan={8}>
                    <Loader />
                  </td>
                </tr>
              )
            }
          </tbody>
        </Table>

        {labourData.totalLabour && !isLoading ? (
          <PaginationHelper
            totalRecords={labourData.totalLabour}
            onPageChanged={page => {
              this.onPageChange(page);
            }}
            currentPage={page}
            pageLimit={AppConfig.ITEMS_PER_PAGE}
          />
        ) : null}
        <CrmLabourModal
          profileInfoReducer={profileInfoReducer.profileInfo}
          rateStandardListData={rateStandardListReducer}
          tyreModalOpen={tireEditModalOpen}
          onTypeHeadStdFun={this.onTypeHeadStdFun}
          setDefaultRate={this.setDefaultRate}
          getStdList={this.props.getStdList}
          dataLabour={this.state.labour}
          addRate={this.addRate}
          updateLabour={this.updateLabour}
          handleLabourModal={() =>
            modelOperate({
              tireEditModalOpen: !tireEditModalOpen
            })
          }
          rateAddModalProp={rateAddModalOpen}
          rateAddModalFun={() =>
            modelOperate({
              rateAddModalOpen: !rateAddModalOpen
            })}
        />
      </>
    );
  }
}

const mapStateToProps = state => ({
  profileInfoReducer: state.profileInfoReducer,
  labourReducer: state.labourReducer,
});

const mapDispatchToProps = dispatch => ({
  updateLabour: (data) => {
    dispatch(labourEditRequest(data))
  },
  deleteLabour: data => {
    dispatch(deleteLabour(data));
  },
  getStdList: data => {
    dispatch(getRateStandardListRequest(data));
  },
  getlabour: data => {
    dispatch(labourListRequest(data));
  },
  setLabourRateDefault: data => {
    dispatch(setRateStandardListStart(data));
  },
  addRate: (data) => {
    dispatch(rateAddRequest(data));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Labours);