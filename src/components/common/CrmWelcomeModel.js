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
  Label,
  Input
} from "reactstrap";
import Dropzone from 'react-dropzone'

import Slider from "@material-ui/lab/Slider";
import Cropper from "react-easy-crop";

export class BigModals extends Component {
  constructor(props) {
    super(props);
    this.state = {
      large: false,
      companyLogo: "",
      crop: { x: 0, y: 0 },
      zoom: 1,
      aspect: 4 / 3,
      peopleWork: {
        selected: "",
        allPeopleArray: ["1-2", "3-6", "7-10", "11+"]
      },
      servicesOffer: {
        selectedServices: [],
        allServices: [
          {
            key: "Repair & Maintenance",
            icon: "/assets/img/repairing-car.svg"
          },
          {
            key: "Detail, Wrap & Film",
            icon: "/assets/img/carPaintingLogo.svg"
          },
          {
            key: "Restoration & Custom Builds",
            icon: "/assets/img/carChachisLogo.svg"
          },
          {
            key: "Others",
            icon: "/assets/img/list-dots.svg"
          }
        ]
      },
      vehicleServicesOffer: {
        selectedServices: [],
        allVehicleServices: [
          {
            key: "Cars",
            icon: "/assets/img/repairing-car.svg"
          },
          {
            key: "Detail, Wrap & Film",
            icon: "/assets/img/carPaintingLogo.svg"
          },
          {
            key: "Restoration & Custom Builds",
            icon: "/assets/img/carChachisLogo.svg"
          },
          {
            key: "Others",
            icon: "/assets/img/list-dots.svg"
          }
        ]
      }
    };
    this.cropper = React.createRef();
  }
  
  onCropChange = crop => {
    this.setState({ crop })
  }

  onCropComplete = (croppedArea, croppedAreaPixels) => {
    console.log(croppedArea, croppedAreaPixels)
  }

  onZoomChange = zoom => {
    this.setState({ zoom })
  }

  toggleLarge = () => {
    this.setState({
      large: !this.state.large
    });
  };

  onSelectFile = (e) => {
    var reader = new FileReader();
    const scope = this;
    reader.addEventListener("load", () =>
      scope.setState({
        companyLogo: reader.result
      })
    );
    reader.onloadend = function (as) {
      var image = new Image();
      image.onload = function () {
        scope.setState({
          companyLogo: reader.result,
        })
      }
    }
    reader.readAsDataURL(e[0]);
  };

  peopleWorkAction =(event) => {       
    let peopleWork = this.state.peopleWork;
    peopleWork.selected = event;
    this.setState({
      peopleWork: peopleWork
    });
  }

  serviceOfferAction = (event) => {
    let servicesOffer = this.state.servicesOffer;
    if(servicesOffer.selectedServices.length) {
      let checkExistence = servicesOffer.selectedServices.some(
        item => item.key == event.key
      );
      if(!checkExistence) {
        servicesOffer.selectedServices.push(event);
      }
    }
    else {
      console.log(event);
      servicesOffer.selectedServices.push(event);
    }

    this.setState({
      servicesOffer: servicesOffer
    });
  }

  render() {
    const { modalOpen, toggleLarge } = this.props;
    const { companyLogo, peopleWork, servicesOffer } = this.state;
    console.log(servicesOffer.selectedServices); 
      const externalCloseBtn = (
        <button
          className="close"
          style={{ position: "absolute", top: "15px", right: "15px" }}
          onClick={this.toggle}
        >
          &times;dsfsd
        </button>
      );
    return (
      <>
        <Modal
          isOpen={modalOpen}
          toggle={toggleLarge}
          className={"modal-lg " + this.props.className}
        >
          <ModalHeader>Step 2</ModalHeader>
          <ModalBody>
            <h2 className="text-center pb-2">
              Hi Rishabh, You're almost Done!
            </h2>
            <div className="pb-5">
              <h4 className="text-center pb-2">
                1. Tell us about your shop.
              </h4>
              <Row className="justify-content-center">
                <Col md="6">
                  <FormGroup>
                    <Label htmlFor="name" className="font-text">
                      Company Name
                    </Label>
                    <Input type="text" id="name" required />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label htmlFor="name" className="font-text">
                      Website (optional)
                    </Label>
                    <Input type="text" id="name" required />
                  </FormGroup>
                </Col>
              </Row>
              <Row className="justify-content-center pb-2">
                <Col md="6">
                  {companyLogo == "" ? (
                    <Dropzone onDrop={this.onSelectFile}>
                      {({ getRootProps, getInputProps, isDragActive }) => {
                        return (
                          <div className="welcome-image-select-background">
                            <div
                              className="text-center"
                              {...getRootProps()}
                            >
                              <input
                                {...getInputProps()}
                                accept="image/png, image/jpeg"
                              />
                              {
                                <>
                                  <i className="far fa-file-image welcome-image-icon" />
                                  <div className="text-center welcome-image-text">
                                    Shop Logo
                                    <br />
                                    Drag image here or click to add
                                  </div>
                                </>
                              }
                            </div>
                          </div>
                        );
                      }}
                    </Dropzone>
                  ) : null}
                  {companyLogo !== "" ? (
                    <div>
                      <div className="welcome-image-uploaded select-background welcome-image-parnet">
                        <div className="welcome-image-upload">
                          <Cropper
                            image={this.state.companyLogo}
                            crop={this.state.crop}
                            zoom={this.state.zoom}
                            aspect={this.state.aspect}
                            onCropChange={this.onCropChange}
                            onCropComplete={this.onCropComplete}
                            onZoomChange={this.onZoomChange}
                          />
                        </div>
                      </div>
                      <div className="alert cropper-controls">
                        <Row>
                          <Col md="8" className="welcome-slider-left">
                            <Slider
                              className=""
                              value={this.state.zoom}
                              min={1}
                              max={3}
                              step={0.1}
                              aria-labelledby="Zoom"
                              onChange={(e, zoom) =>
                                this.onZoomChange(zoom)
                              }
                            />
                          </Col>
                          <Col md="4">
                            <Button color="primary" className="btn-sm mr-1">
                              Save
                            </Button>
                            <Button color="danger" className="btn-sm">
                              Del
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  ) : null}
                </Col>
                <Col md="6" className="welcome-image-align">
                  <div className="welcome-image-text">
                    <span>
                      Your logo will appear on quotes, invoices, work orders
                      and work request forms.
                    </span>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="pb-3">
              <h4 className="text-center pb-2">
                2. How many people work in your shop?
              </h4>
              <div className="justify-content-center">
                <div className="d-flex box-space">
                  {peopleWork.allPeopleArray.map((item, index) => {
                    return (
                      <div
                        className={
                          peopleWork.selected === item
                            ? "box-contain active"
                            : "box-contain"
                        }
                        onClick={() => this.peopleWorkAction(item)}
                      >
                        <div className="welcome-service-text">{item}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="pb-3">
              <h4 className="text-center pb-2">
                3. What kinds of services do you offer?
              </h4>
              <div className="justify-content-center">
                <div className="d-flex box-space">
                  {servicesOffer.allServices.map((item, index) => {
                    return (
                      <div
                        className={
                          servicesOffer.selectedServices.some(
                            itemSome => itemSome.key === item.key
                          )
                            ? "box-contain active"
                            : "box-contain"
                        }
                        onClick={() => this.serviceOfferAction(item)}
                      >
                        <div className="justify-content-center">
                          <img src={item.icon} alt="" />
                          <div className="welcome-service-text">
                            {item.key}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="pb-3">
              <h4 className="text-center pb-2">
                4. What types of vehicles do you service?
              </h4>
              <div className="justify-content-center">
                <div className="d-flex box-space">
                  <div className="box-contain">
                    <div className="justify-content-center">
                      <img src="/assets/img/carLogo.svg" alt="" />
                      <div className="welcome-service-text">Cars</div>
                    </div>
                  </div>
                  <div className="box-contain">
                    <div>
                      <img src="/assets/img/trukLogo.svg" alt="" />
                      <div className="welcome-service-text">
                        Semi & Heavy Duty
                      </div>
                    </div>
                  </div>
                  <div className="box-contain">
                    <div>
                      <img src="/assets/img/vanLogo.svg" alt="" />
                      <div className="welcome-service-text">RVs</div>
                    </div>
                  </div>
                  <div className="box-contain">
                    <div>
                      <img src="/assets/img/trailerLogo.svg" alt="" />
                      <div className="welcome-service-text">Trailers</div>
                    </div>
                  </div>
                </div>
                <div className="d-flex box-space">
                  <div className="box-contain">
                    <div className="justify-content-center">
                      <img src="/assets/img/motorcycleLogo.svg" alt="" />
                      <div className="welcome-service-text">
                        Motorcycles
                      </div>
                    </div>
                  </div>
                  <div className="box-contain">
                    <img src="/assets/img/boatLogo.svg" alt="" />
                    <div className="welcome-service-text">Boats</div>
                  </div>
                  <div className="box-contain">
                    <img src="/assets/img/cycleLogo.svg" alt="" />
                    <div className="welcome-service-text">Bicycless</div>
                  </div>
                  <div className="box-contain">
                    <img src="/assets/img/list-dots.svg" />
                    <div className="welcome-service-text">Others</div>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={toggleLarge}>
              Update
            </Button>{" "}
            <Button color="secondary" onClick={toggleLarge}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  }
}


