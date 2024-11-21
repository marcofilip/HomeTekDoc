(function(){"use strict";var e={4298:function(e,t,o){var a=o(5130),r=o(6768);function n(e,t){const o=(0,r.g2)("router-link"),a=(0,r.g2)("router-view");return(0,r.uX)(),(0,r.CE)(r.FK,null,[(0,r.Lk)("nav",null,[(0,r.bF)(o,{to:"/"},{default:(0,r.k6)((()=>t[0]||(t[0]=[(0,r.eW)("Home")]))),_:1}),t[5]||(t[5]=(0,r.eW)(" | ")),(0,r.bF)(o,{to:"/about"},{default:(0,r.k6)((()=>t[1]||(t[1]=[(0,r.eW)("About")]))),_:1}),t[6]||(t[6]=(0,r.eW)(" | ")),(0,r.bF)(o,{to:"/login"},{default:(0,r.k6)((()=>t[2]||(t[2]=[(0,r.eW)("Login")]))),_:1}),t[7]||(t[7]=(0,r.eW)(" | ")),(0,r.bF)(o,{to:"/register"},{default:(0,r.k6)((()=>t[3]||(t[3]=[(0,r.eW)("Register")]))),_:1}),t[8]||(t[8]=(0,r.eW)(" | ")),(0,r.bF)(o,{to:"/utenti"},{default:(0,r.k6)((()=>t[4]||(t[4]=[(0,r.eW)("Utenti")]))),_:1})]),(0,r.bF)(a)],64)}var s=o(1241);const l={},i=(0,s.A)(l,[["render",n]]);var c=i,u=o(1387);const d={class:"about"};function m(e,t){return(0,r.uX)(),(0,r.CE)("div",d,t[0]||(t[0]=[(0,r.Lk)("h1",null,"This is an about page",-1)]))}const f={},g=(0,s.A)(f,[["render",m]]);var h=g,b=(o(4114),o(4232));const p={class:"text-center mt-6"};function k(e,t,o,n,s,l){const i=(0,r.g2)("v-card-title"),c=(0,r.g2)("v-text-field"),u=(0,r.g2)("v-btn"),d=(0,r.g2)("v-form"),m=(0,r.g2)("v-card-text"),f=(0,r.g2)("v-card"),g=(0,r.g2)("v-col"),h=(0,r.g2)("v-row"),k=(0,r.g2)("v-snackbar"),w=(0,r.g2)("v-container");return(0,r.uX)(),(0,r.Wv)(w,{fluid:"",class:"fill-height login-bg"},{default:(0,r.k6)((()=>[(0,r.bF)(h,{align:"center",justify:"center"},{default:(0,r.k6)((()=>[(0,r.bF)(g,{cols:"12",sm:"8",md:"4"},{default:(0,r.k6)((()=>[(0,r.bF)(f,{elevation:"12",class:"rounded-lg"},{default:(0,r.k6)((()=>[(0,r.bF)(i,{class:"text-center justify-center py-6"},{default:(0,r.k6)((()=>t[6]||(t[6]=[(0,r.Lk)("h1",{class:"font-weight-bold text-h4 primary--text"}," Ben tornato! ",-1)]))),_:1}),(0,r.bF)(m,null,{default:(0,r.k6)((()=>[(0,r.bF)(d,{onSubmit:(0,a.D$)(l.login,["prevent"]),ref:"form"},{default:(0,r.k6)((()=>[(0,r.bF)(c,{modelValue:s.loginData.username,"onUpdate:modelValue":t[0]||(t[0]=e=>s.loginData.username=e),"prepend-inner-icon":"mdi-account",label:"Username",type:"text",outlined:"",dense:"",rules:[e=>!!e||"Username necessario"],class:"mb-3"},null,8,["modelValue","rules"]),(0,r.bF)(c,{modelValue:s.loginData.password,"onUpdate:modelValue":t[1]||(t[1]=e=>s.loginData.password=e),"prepend-inner-icon":"mdi-lock",label:"Password",type:s.showPassword?"text":"password",outlined:"",dense:"",rules:[e=>!!e||"Password necessaria"],"append-icon":s.showPassword?"mdi-eye":"mdi-eye-off","onClick:append":t[2]||(t[2]=e=>s.showPassword=!s.showPassword)},null,8,["modelValue","type","rules","append-icon"]),(0,r.bF)(u,{type:"submit",color:"primary",block:"","x-large":"",elevation:"2",loading:s.loading,class:"mt-4"},{default:(0,r.k6)((()=>t[7]||(t[7]=[(0,r.eW)(" Sign In ")]))),_:1},8,["loading"])])),_:1},8,["onSubmit"]),(0,r.Lk)("div",p,[t[9]||(t[9]=(0,r.Lk)("span",{class:"grey--text text--darken-2"},"Non hai ancora un account?",-1)),(0,r.bF)(u,{text:"",color:"primary",onClick:t[3]||(t[3]=t=>e.$router.push("/register")),class:"ml-2"},{default:(0,r.k6)((()=>t[8]||(t[8]=[(0,r.eW)(" Registrati ")]))),_:1})])])),_:1})])),_:1})])),_:1})])),_:1}),(0,r.bF)(k,{modelValue:s.snackbar.show,"onUpdate:modelValue":t[5]||(t[5]=e=>s.snackbar.show=e),color:s.snackbar.color,timeout:3e3,bottom:""},{action:(0,r.k6)((({attrs:e})=>[(0,r.bF)(u,(0,r.v6)({text:""},e,{onClick:t[4]||(t[4]=e=>s.snackbar.show=!1)}),{default:(0,r.k6)((()=>t[10]||(t[10]=[(0,r.eW)(" Chiudi ")]))),_:2},1040)])),default:(0,r.k6)((()=>[(0,r.eW)((0,b.v_)(s.snackbar.text)+" ",1)])),_:1},8,["modelValue","color"])])),_:1})}var w={data(){return{loginData:{username:"",password:""},showPassword:!1,loading:!1,snackbar:{show:!1,text:"",color:"success"}}},methods:{async login(){if(this.$refs.form.validate()){this.loading=!0;try{const t=await fetch("http://65.109.163.183:3000/auth/login",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(this.loginData)}),o=await t.text();let a;console.log("Raw response:",o);try{a=JSON.parse(o)}catch(e){throw console.error("Parse error:",e),new Error("Invalid server response")}if(!t.ok)throw new Error(a.error||"Login failed");console.log("Login successful:",a),localStorage.setItem("isLoggedIn","true"),localStorage.setItem("isAdmin",a.isAdmin),localStorage.setItem("username",a.username),this.showSnackbarMessage("Login successful!","success"),setTimeout((()=>{a.isAdmin?this.$router.push("/gestione-utenti"):this.$router.push("/")}),1e3)}catch(t){console.error("Login error:",t),this.showSnackbarMessage(t.message,"error")}finally{this.loading=!1}}},showSnackbarMessage(e,t){this.snackbar.text=e,this.snackbar.color=t,this.snackbar.show=!0}}};const v=(0,s.A)(w,[["render",k],["__scopeId","data-v-2c3c8c3a"]]);var y=v;const _={class:"text-center mt-6"};function F(e,t,o,n,s,l){const i=(0,r.g2)("v-card-title"),c=(0,r.g2)("v-text-field"),u=(0,r.g2)("v-btn"),d=(0,r.g2)("v-form"),m=(0,r.g2)("v-card-text"),f=(0,r.g2)("v-card"),g=(0,r.g2)("v-col"),h=(0,r.g2)("v-row"),p=(0,r.g2)("v-snackbar"),k=(0,r.g2)("v-container");return(0,r.uX)(),(0,r.Wv)(k,{fluid:"",class:"fill-height register-bg"},{default:(0,r.k6)((()=>[(0,r.bF)(h,{align:"center",justify:"center"},{default:(0,r.k6)((()=>[(0,r.bF)(g,{cols:"12",sm:"8",md:"4"},{default:(0,r.k6)((()=>[(0,r.bF)(f,{elevation:"12",class:"rounded-lg"},{default:(0,r.k6)((()=>[(0,r.bF)(i,{class:"text-center justify-center py-6"},{default:(0,r.k6)((()=>t[10]||(t[10]=[(0,r.Lk)("h1",{class:"font-weight-bold text-h4 primary--text"}," Crea Account ",-1)]))),_:1}),(0,r.bF)(m,null,{default:(0,r.k6)((()=>[(0,r.bF)(d,{onSubmit:(0,a.D$)(l.register,["prevent"]),ref:"form"},{default:(0,r.k6)((()=>[(0,r.bF)(c,{modelValue:s.registerData.username,"onUpdate:modelValue":t[0]||(t[0]=e=>s.registerData.username=e),"prepend-inner-icon":"mdi-account",label:"Username",type:"text",outlined:"",dense:"",rules:[e=>!!e||"Username richiesto"],class:"mb-3"},null,8,["modelValue","rules"]),(0,r.bF)(c,{modelValue:s.registerData.nome,"onUpdate:modelValue":t[1]||(t[1]=e=>s.registerData.nome=e),"prepend-inner-icon":"mdi-account-circle",label:"Name",type:"text",outlined:"",dense:"",rules:[e=>!!e||"Nome richiesto"],class:"mb-3"},null,8,["modelValue","rules"]),(0,r.bF)(c,{modelValue:s.registerData.email,"onUpdate:modelValue":t[2]||(t[2]=e=>s.registerData.email=e),"prepend-inner-icon":"mdi-email",label:"Email",type:"email",outlined:"",dense:"",rules:[e=>!!e||"Email richiesta"],class:"mb-3"},null,8,["modelValue","rules"]),(0,r.bF)(c,{modelValue:s.registerData.citta,"onUpdate:modelValue":t[3]||(t[3]=e=>s.registerData.citta=e),"prepend-inner-icon":"mdi-city",label:"City",type:"text",outlined:"",dense:"",rules:[e=>!!e||"Città richiesta"],class:"mb-3"},null,8,["modelValue","rules"]),(0,r.bF)(c,{modelValue:s.registerData.password,"onUpdate:modelValue":t[4]||(t[4]=e=>s.registerData.password=e),"prepend-inner-icon":"mdi-lock",label:"Password",type:s.showPassword?"text":"password",outlined:"",dense:"",rules:[e=>!!e||"Password richiesta",e=>e.length>=6||"La password deve avere almeno 6 caratteri."],"append-icon":s.showPassword?"mdi-eye":"mdi-eye-off","onClick:append":t[5]||(t[5]=e=>s.showPassword=!s.showPassword),class:"mb-3"},null,8,["modelValue","type","rules","append-icon"]),(0,r.bF)(c,{modelValue:s.confirmPassword,"onUpdate:modelValue":t[6]||(t[6]=e=>s.confirmPassword=e),"prepend-inner-icon":"mdi-lock-check",label:"Confirm Password",type:s.showPassword?"text":"password",outlined:"",dense:"",rules:[e=>!!e||"Conferma la password.",e=>e===s.registerData.password||"Le password sono differenti."]},null,8,["modelValue","type","rules"]),(0,r.bF)(u,{type:"submit",color:"primary",block:"","x-large":"",elevation:"2",loading:s.loading,class:"mt-4"},{default:(0,r.k6)((()=>t[11]||(t[11]=[(0,r.eW)(" Sign Up ")]))),_:1},8,["loading"])])),_:1},8,["onSubmit"]),(0,r.Lk)("div",_,[t[13]||(t[13]=(0,r.Lk)("span",{class:"grey--text text--darken-2"},"Hai già un account?",-1)),(0,r.bF)(u,{text:"",color:"primary",onClick:t[7]||(t[7]=t=>e.$router.push("/login")),class:"ml-2"},{default:(0,r.k6)((()=>t[12]||(t[12]=[(0,r.eW)(" Accedi ")]))),_:1})])])),_:1})])),_:1})])),_:1})])),_:1}),(0,r.bF)(p,{modelValue:s.snackbar.show,"onUpdate:modelValue":t[9]||(t[9]=e=>s.snackbar.show=e),color:s.snackbar.color,timeout:3e3,bottom:""},{action:(0,r.k6)((({attrs:e})=>[(0,r.bF)(u,(0,r.v6)({text:""},e,{onClick:t[8]||(t[8]=e=>s.snackbar.show=!1)}),{default:(0,r.k6)((()=>t[14]||(t[14]=[(0,r.eW)(" Chiudi ")]))),_:2},1040)])),default:(0,r.k6)((()=>[(0,r.eW)((0,b.v_)(s.snackbar.text)+" ",1)])),_:1},8,["modelValue","color"])])),_:1})}var x={data(){return{registerData:{username:"",password:"",nome:"",email:"",citta:""},confirmPassword:"",showPassword:!1,loading:!1,snackbar:{show:!1,text:"",color:"success"}}},methods:{async register(){if(this.$refs.form.validate())if(this.registerData.password===this.confirmPassword){this.loading=!0;try{const e=await fetch("http://65.109.163.183:3000/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(this.registerData)}),t=await e.json();if(!e.ok)throw new Error(t.error||"Registration failed");this.showSnackbarMessage("Registration successful! Please login.","success"),this.$refs.form.reset(),this.registerData={username:"",password:"",nome:"",email:"",citta:""},this.confirmPassword="",setTimeout((()=>{this.$router.push("/login")}),2e3)}catch(e){this.showSnackbarMessage(e.message,"error")}finally{this.loading=!1}}else this.showSnackbarMessage("Passwords do not match","error")},showSnackbarMessage(e,t){this.snackbar.text=e,this.snackbar.color=t,this.snackbar.show=!0}}};const D=(0,s.A)(x,[["render",F],["__scopeId","data-v-0c4caff6"]]);var S=D;function V(e,t,o,a,n,s){const l=(0,r.g2)("v-card-title"),i=(0,r.g2)("v-list-item-title"),c=(0,r.g2)("v-list-item-subtitle"),u=(0,r.g2)("v-list-item-content"),d=(0,r.g2)("v-icon"),m=(0,r.g2)("v-btn"),f=(0,r.g2)("v-list-item-action"),g=(0,r.g2)("v-list-item"),h=(0,r.g2)("v-list"),p=(0,r.g2)("v-alert"),k=(0,r.g2)("v-card-text"),w=(0,r.g2)("v-card"),v=(0,r.g2)("v-col"),y=(0,r.g2)("v-row"),_=(0,r.g2)("v-spacer"),F=(0,r.g2)("v-card-actions"),x=(0,r.g2)("v-dialog"),D=(0,r.g2)("v-container");return(0,r.uX)(),(0,r.Wv)(D,null,{default:(0,r.k6)((()=>[(0,r.bF)(y,{justify:"center"},{default:(0,r.k6)((()=>[(0,r.bF)(v,{cols:"12",md:"8"},{default:(0,r.k6)((()=>[t[5]||(t[5]=(0,r.Lk)("h1",{class:"text-h3 text-center mb-6"},"Gestione Utenti",-1)),(0,r.bF)(w,null,{default:(0,r.k6)((()=>[(0,r.bF)(l,null,{default:(0,r.k6)((()=>t[2]||(t[2]=[(0,r.eW)("Lista Utenti")]))),_:1}),(0,r.bF)(k,null,{default:(0,r.k6)((()=>[n.users.length>0?((0,r.uX)(),(0,r.Wv)(h,{key:0},{default:(0,r.k6)((()=>[((0,r.uX)(!0),(0,r.CE)(r.FK,null,(0,r.pI)(n.users,(e=>((0,r.uX)(),(0,r.Wv)(g,{key:e.id},{default:(0,r.k6)((()=>[(0,r.bF)(u,null,{default:(0,r.k6)((()=>[(0,r.bF)(i,{class:"font-weight-bold"},{default:(0,r.k6)((()=>[(0,r.eW)((0,b.v_)(e.nome),1)])),_:2},1024),(0,r.bF)(c,null,{default:(0,r.k6)((()=>[(0,r.eW)(" Email: "+(0,b.v_)(e.email),1)])),_:2},1024),(0,r.bF)(c,null,{default:(0,r.k6)((()=>[(0,r.eW)(" Città: "+(0,b.v_)(e.citta),1)])),_:2},1024)])),_:2},1024),(0,r.bF)(f,null,{default:(0,r.k6)((()=>[(0,r.bF)(m,{icon:"",color:"error",onClick:t=>s.confirmDelete(e.id)},{default:(0,r.k6)((()=>[(0,r.bF)(d,null,{default:(0,r.k6)((()=>t[3]||(t[3]=[(0,r.eW)("mdi-delete")]))),_:1})])),_:2},1032,["onClick"])])),_:2},1024)])),_:2},1024)))),128))])),_:1})):((0,r.uX)(),(0,r.Wv)(p,{key:1,type:"info",text:""},{default:(0,r.k6)((()=>t[4]||(t[4]=[(0,r.eW)(" Nessun utente trovato! ")]))),_:1}))])),_:1})])),_:1})])),_:1})])),_:1}),(0,r.bF)(x,{modelValue:n.deleteDialog,"onUpdate:modelValue":t[1]||(t[1]=e=>n.deleteDialog=e),"max-width":"300"},{default:(0,r.k6)((()=>[(0,r.bF)(w,null,{default:(0,r.k6)((()=>[(0,r.bF)(l,null,{default:(0,r.k6)((()=>t[6]||(t[6]=[(0,r.eW)("Conferma eliminazione")]))),_:1}),(0,r.bF)(k,null,{default:(0,r.k6)((()=>t[7]||(t[7]=[(0,r.eW)(" Sei sicuro di voler eliminare questo utente? ")]))),_:1}),(0,r.bF)(F,null,{default:(0,r.k6)((()=>[(0,r.bF)(_),(0,r.bF)(m,{color:"grey darken-1",text:"",onClick:t[0]||(t[0]=e=>n.deleteDialog=!1)},{default:(0,r.k6)((()=>t[8]||(t[8]=[(0,r.eW)(" Annulla ")]))),_:1}),(0,r.bF)(m,{color:"error",text:"",onClick:s.deleteUser},{default:(0,r.k6)((()=>t[9]||(t[9]=[(0,r.eW)(" Elimina ")]))),_:1},8,["onClick"])])),_:1})])),_:1})])),_:1},8,["modelValue"])])),_:1})}var W={data(){return{users:[],newUser:{nome:"",email:"",citta:""},deleteDialog:!1,userToDelete:null}},mounted(){this.loadUsers()},methods:{async loadUsers(){try{const e=await fetch("http://65.109.163.183:3000/utenti");if(!e.ok)throw new Error("Errore nel caricamento degli utenti");const t=await e.json();console.log("Fetched data: ",t),this.users=t.utenti.map((e=>({id:e.id,nome:e.nome,email:e.email,citta:e.citta})))}catch(e){console.error("Load users error:",e),this.showSnackbar("Errore nel caricamento degli utenti","error")}},async submitUser(){if(this.$refs.form.validate())try{const e=await fetch("http://65.109.163.183:3000/utenti",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(this.newUser)});if(!e.ok)throw new Error("Errore nell'aggiunta dell'utente");this.showSnackbar("Utente aggiunto con successo","success"),this.$refs.form.reset(),this.newUser={nome:"",email:"",citta:""},await this.loadUsers()}catch(e){console.error("Submit user error:",e),this.showSnackbar("Errore nell'aggiunta dell'utente","error")}},confirmDelete(e){console.log("User ID to delete:",e),this.userToDelete=e,this.deleteDialog=!0},async deleteUser(){try{console.log("Deleting user with ID:",this.userToDelete);const e=await fetch(`http://65.109.163.183:3000/utenti/${this.userToDelete}`,{method:"DELETE"});if(!e.ok)throw new Error("Errore nell'eliminazione dell'utente");this.showSnackbar("Utente eliminato con successo","success"),this.deleteDialog=!1,await this.loadUsers()}catch(e){console.error("Delete user error:",e),this.showSnackbar("Errore nell'eliminazione dell'utente","error")}}}};const U=(0,s.A)(W,[["render",V],["__scopeId","data-v-7be4ad37"]]);var P=U;const C=[{path:"/",name:"login",component:y},{path:"/utenti",name:"utenti",component:P,beforeEnter:(e,t,o)=>{"true"===localStorage.getItem("isAdmin")?o():(alert("Accesso negato: non autorizzato."),o("/login"))}},{path:"/login",name:"login",component:y},{path:"/register",name:"register",component:S},{path:"/about",name:"about",component:h}],E=(0,u.aE)({history:(0,u.LA)("/"),routes:C});var L=E,O=(o(5524),o(7768)),j=o(1920),T=o(5741);const A=(0,O.$N)({icons:{iconfont:"mdi"},components:j,directives:T,theme:{defaultTheme:"dark"}});(0,a.Ef)(c).use(L).use(A).mount("#app")}},t={};function o(a){var r=t[a];if(void 0!==r)return r.exports;var n=t[a]={exports:{}};return e[a].call(n.exports,n,n.exports,o),n.exports}o.m=e,function(){var e=[];o.O=function(t,a,r,n){if(!a){var s=1/0;for(u=0;u<e.length;u++){a=e[u][0],r=e[u][1],n=e[u][2];for(var l=!0,i=0;i<a.length;i++)(!1&n||s>=n)&&Object.keys(o.O).every((function(e){return o.O[e](a[i])}))?a.splice(i--,1):(l=!1,n<s&&(s=n));if(l){e.splice(u--,1);var c=r();void 0!==c&&(t=c)}}return t}n=n||0;for(var u=e.length;u>0&&e[u-1][2]>n;u--)e[u]=e[u-1];e[u]=[a,r,n]}}(),function(){o.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return o.d(t,{a:t}),t}}(),function(){o.d=function(e,t){for(var a in t)o.o(t,a)&&!o.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})}}(),function(){o.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){o.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){var e={524:0};o.O.j=function(t){return 0===e[t]};var t=function(t,a){var r,n,s=a[0],l=a[1],i=a[2],c=0;if(s.some((function(t){return 0!==e[t]}))){for(r in l)o.o(l,r)&&(o.m[r]=l[r]);if(i)var u=i(o)}for(t&&t(a);c<s.length;c++)n=s[c],o.o(e,n)&&e[n]&&e[n][0](),e[n]=0;return o.O(u)},a=self["webpackChunksites"]=self["webpackChunksites"]||[];a.forEach(t.bind(null,0)),a.push=t.bind(null,a.push.bind(a))}();var a=o.O(void 0,[504],(function(){return o(4298)}));a=o.O(a)})();
//# sourceMappingURL=app.790da706.js.map