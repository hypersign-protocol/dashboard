<style scoped>
.addmargin {
  margin-top: 10px;
  margin-bottom: 10px;
}

.vue-logo-back {
  background-color: black;
}

.logo {
  width: 144px;
}

.fullbody {
  width: 100%;
}

.floatLeft {
  float: left;
}
.floatRight {
  float: right;
}
.card-header {
  background: aliceblue;
  padding: 0px;
}
.sm-tiles {
  float: left;
  padding: 5px;
  border: 1px solid #8080807d;
  margin: 1%;
  border-radius: 5px;
  background: #f5dda71c;
  color: #888b8f;
}
.sm-tiles:hover {
  float: left;
  padding: 5px;
  border: 1px solid #8080807d;
  margin: 1%;
  border-radius: 5px;
  background: #f5dda7a3;
  font-style: bold;
  color: #888b8f;
}

.card {
  border-radius: 10px;
}
</style>
<template>
  <div class="home marginLeft marginRight">
    <loading
      :active.sync="isLoading"
      :can-cancel="true"
      :is-full-page="fullPage"
    ></loading>

    <div class="row">
      <div class="col-md-12" style="text-align: left">
        <!-- <Info :message="description"/> -->
        <div class="card">
          <div class="card-header">
            <b-button v-b-toggle.collapse-1 variant="link"
              >Schema Configuration</b-button
            >
          </div>
          <b-collapse id="collapse-1" class="mt-2">
            <div class="card-body">
              <Errors v-if="errors.length > 0" :errors="errors" />
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group form-inline">
                    <label style="margin-right: 8%">Schema Name:</label>
                    <input
                      type="text"
                      v-model="credentialName"
                      size="30"
                      placeholder="Enter schema name"
                      class="form-control"
                    />
                  </div>
                  <div class="form-group form-inline">
                    <label style="margin-right: 12%">Description:</label>
                    <textarea
                      v-model="credentialDescription"
                      rows="5"
                      cols="29"
                      placeholder="Enter description"
                      class="form-control"
                    ></textarea>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group form-inline">
                    <label style="margin-right: 5%">Add attribute:</label>
                    <input
                      type="text"
                      class="form-control"
                      size="30"
                      v-model="attributeName"
                      placeholder="Enter attribute name"
                    />
                    <a
                      class="btn btn-primary"
                      style="margin-left: 2%; border-radius: 30px; color: white"
                      v-on:click="addBlankAttrBox()"
                      >+</a
                    >
                  </div>
                  <div
                    class="form-group"
                    style="min-height: 150px; max-height: 150px; overflow: auto"
                  >
                    <div v-for="attr in attributes" :key="attr">
                      <div class="sm-tiles">
                        {{ attr }}
                        <span>x</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12">
                  <hr />
                  <button
                    class="btn btn-outline-primary btn-sm"
                    @click="createSchema()"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </b-collapse>
        </div>
      </div>
    </div>
    <div class="row" style="margin-top: 2%">
      <div class="col-md-12">
        <table class="table table-bordered" style="background: #ffff">
          <thead class="thead-light">
            <tr>
              <th>Schema Id</th>
              <th>Schema Name</th>
              <th>Attributes</th>
              <th>Version</th>
              <th>Description</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in schemaList" :key="row">
              <th>
                <div class="custom-control custom-checkbox">
                  <label :for="row.id"
                    ><a
                      :href="
                        `${$config.nodeServer.BASE_URL}api/v1/schema/` +
                        row.id
                      "
                      target="_blank"
                      >{{ row.id }}</a
                    ></label
                  >
                </div>
              </th>
              <td>{{ row.credentialName }}</td>
              <td
                style="
                  word-wrap: break-word;
                  min-width: 200px;
                  max-width: 200px;
                "
              >
                <div
                  class="sm-tiles"
                  v-for="attr in row.attributes"
                  :key="attr"
                >
                  {{ attr }}
                </div>
              </td>
              <td>{{ row.version }}</td>
              <td>{{ row.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import fetch from "node-fetch";
import QrcodeVue from "qrcode.vue";
import Info from "@/components/Info.vue";
import Errors from "@/components/Errors.vue";
import Loading from "vue-loading-overlay";
import { specialCharCheck } from '../utils/utility';
export default {
  name: "IssueCredential",
  components: { QrcodeVue, Info, Errors, Loading },
  data() {
    return {
      description:
        "Credential Schema defines what information will go inside a verifiable credential. For example: Directorate General of Civil Aviation (DGCA) can define a schema (or format) for flights tickets, being issued by all airline companies in India.",
      active: 0,
      host: location.hostname,
      user: {},
      prevRoute: null,
      attributeName: "",
      attributes: [],
      issueCredAttributes: [],
      showSchema: true,
      radioSelected: "create",
      credentialName: "",
      isCredentialIssued: false,
      signedVerifiableCredential: "",
      credentials: JSON.parse(localStorage.getItem("credentials")),
      subjectDid: "did:hs:AmitKumar",
      radioOptions: [
        { text: "Create new schema", value: "create" },
        { text: "Select existing schema", value: "existing" },
      ],
      selected: null,
      attributeValues: {},
      authToken: localStorage.getItem("authToken"),
      selectOptions: [{ value: null, text: "Please select a schema" }],
      schemaList: [],
      credentialDescription: "",
      fullPage: true,
      isLoading: false,
      errors: [],
    };
  },
  created() {
    const usrStr = localStorage.getItem("user");
    this.user = JSON.parse(usrStr);
    this.fetchSchemas();
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.prevRoute = from;
    });
  },
  methods: {
    notifySuccess(msg) {
      this.$notify({
        group: "foo",
        title: "Information",
        type: "success",
        text: msg,
      });
    },
    notifyErr(msg) {
      this.$notify({
        group: "foo",
        title: "Error",
        type: "error",
        text: msg,
      });
    },
    formatSchemaString(schemaStr){
      const sJson =  schemaStr;
                console.log(sJson)
                if(sJson){
                  const schemaObj =  JSON.parse(sJson);
                  const schema = {
                    id: "",
                    credentialName: "",
                    version: "",
                    attributes: [],
                    description: ""
                  }

                  schema.id = schemaObj.id;
                  schema.credentialName = schemaObj.name;
                  schema.version = schemaObj.modelVersion;
                  schema.attributes = schemaObj.schema.required;
                  schema.description = schemaObj.schema.description;
                  return schema;
              }else{
                return null
              }
    },
    fetchSchemas() {
      const url = `${this.$config.studioServer.BASE_URL}hs/api/v2/schema/get`;
      fetch(url, {
                    headers: {
                        "Authorization": `Bearer ${this.authToken}`
                    },
                    method: "GET"
                },)
        .then((res) => res.json())
        .then((j) => {
          if (j.status != 200) throw new Error(j.error);
          const schemas =  j.message;
          if(schemas && schemas.length > 0){
            schemas.forEach(element => {
              const schema  = this.formatSchemaString(element.schemaString)
              if(schema){
                this.schemaList.push(schema);
              }
            });
          }
          
          console.log(JSON.stringify(this.schemaList))
        })
        .catch((e) => this.notifyErr(`Error: ${e.message}`));
    },
    fetchData(url) {
      fetch(url)
        .then((res) => res.json())
        .then((j) => {
          if (j.status != 200) throw new Error(j.error);
          return j.message;
        })
        .catch((e) => this.notifyErr(`Error: ${e.message}`));
    },
    gotosubpage: (id) => {
      this.$router.push(`${id}`);
    },
    addBlankAttrBox() {
      if (this.attributeName != " ") {
        this.attributes.push(this.attributeName.trim());
        this.attributeName = " ";
      }
    },
    clearFields() {
      this.attributes = [];
      this.credentialDescription = "";
      this.credentialName = "";
    },
    forceFileDownload(data, fileName) {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
    },
    downloadCredentials() {
      this.forceFileDownload(
        JSON.stringify(this.signedVerifiableCredential),
        "vc.json"
      );
    },
    fieldValidations() {
      this.errors = [];
      if (this.credentialName == "")
        this.errors.push("Schema Name can not be empty");
      if (this.attributes.length == 0)
        this.errors.push("Atleast one attribute is required");

      if (this.credentialName != "" && specialCharCheck(this.credentialName))
        this.errors.push("Schema Name can not contain special character");

      if (this.errors.length > 0) return false;
      else return true;
    },
    createSchema() {
      if (!this.fieldValidations()) {
          setTimeout(() => {
            this.errors = []
          }, 5000)
          return
      }

      this.isLoading = true;

      const url = `${this.$config.studioServer.BASE_URL}hs/api/v2/schema/create`;
      //console.log(url)
      const schemaData = {
        name: this.credentialName,
        owner: this.user.id,
        attributes: this.attributes,
        description: this.credentialDescription,
      };
      let headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.authToken}`,
      };

      //console.log(headers)
      fetch(url, {
        method: "POST",
        body: JSON.stringify(schemaData),
        headers,
      })
        .then((res) => res.json())
        .then((j) => {
          if (j.status === 200) {
            this.notifySuccess("Schema successfull created");
            const schema  = this.formatSchemaString(j.message.schemaString)
            if(schema){
              this.schemaList.push(schema);
            }
            this.isLoading = false;
          } else {
            this.notifyErr(`Error: ${j.error}`);
          }
          this.isLoading = false;
        }).catch(e => {
          this.isLoading = false;
          this.notifyErr(`Error: ${e.message}`);
        });

        this.clearFields()

    },
  },
};
</script>


