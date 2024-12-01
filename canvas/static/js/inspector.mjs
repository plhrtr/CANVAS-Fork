export class Inspector {
  constructor(picker) {
    this.picker = picker;
    this.positionConfigurator = new PositionConfigurator(picker);
  }
  render() {
    return (
      "<h4 class='fw-bold'> Object " +
      this.picker.getSelectedObject().id +
      "</h4>" +
      "<div class='accordion w-100' id='accordionInspector'>" +
      this.positionConfigurator.render() +
      "</div>"
    );
  }

  listen() {
    this.positionConfigurator.listen();
  }
}

export class PositionConfigurator {
  constructor(picker) {
    this.picker = picker;
  }

  render() {
    let object = this.picker.getSelectedObject();
    return (
      "<div class='accordion-item'>" +
      "<h2 class='accordion-header'><button class='accordion-button' type='button' data-bs-toggle='collapse' data-bs-target='#collapseOne' aria-expanded='true' aria-controls='collapseOne'>Position</button> </h2>" +
      "<div id='collapseOne' class='accordion-collapse collapse show'><div class='accordion-body'>" +
      "<div class='d-flex gap-2 flex-column'>" +
      "<div class='d-flex align-items-center gap-2'><div>N:</div><input type='number' id='x' class='form-control' placeholder='" +
      object.position.x +
      "'/></div>" +
      "<div class='d-flex align-items-center gap-2'><div>E:</div><input type='number' id='z' class='form-control' placeholder='" +
      object.position.z +
      "'/></div>" +
      "<div class='d-flex align-items-center gap-2'><div>U:</div><input type='number' id='y' class='form-control' placeholder='" +
      object.position.y +
      "'/></div>" +
      "</div>" +
      "</div></div>" +
      "</div>"
    );
  }

  listen() {
    document.getElementById("x").addEventListener("change", () => {
      let object = this.picker.getSelectedObject();
      if (object) {
        let value = document.getElementById("x").value;
        if (!isNaN(value)) {
          object.position.setX(Number(value));
        }
      }
    });

    document.getElementById("y").addEventListener("change", () => {
      let object = this.picker.getSelectedObject();
      if (object) {
        let value = document.getElementById("y").value;
        if (!isNaN(value)) {
          object.position.setY(Number(value));
        }
      }
    });

    document.getElementById("z").addEventListener("change", () => {
      let object = this.picker.getSelectedObject();
      if (object) {
        let value = document.getElementById("z").value;
        if (!isNaN(value)) {
          object.position.setZ(Number(value));
        }
      }
    });
  }
}
