var userNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function () {

    if (userNumber === null) {
      this.askUserNumber();
    }

    //Get the toys collection
    var toys = await this.getToys();

    //makerFound Event
    this.el.addEventListener("markerFound", () => {
      if (userNumber !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(toys, markerId);
      }
    });
    //markerLost Event
    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },
  askUserNumber: function () {
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title: "Welcome to NotFreeToys!!",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeholder: "Type your user number",
          type: "number",
          min: 1
        }
      },
      closeOnClickOutside: false,
    }).then(inputValue => {
      userNumber = inputValue;
    });
  },

    handleMarkerFound: function (toys, markerId) {
        var toy = toys.filter(toy=>toy.id===markerId)[0]
        if(toy.unavailable_toy.includes(toy.unavailable_toy==="unavailable")){
    swal({
      icon:"warning",
      title:toy.toy_name.toUpperCase(),
      text:"this toy is not available",
      timer:2500,
      buttons:false
    })
        }
        else{
          var model = document.querySelector(`#model-${toy.id}`);    
         
          model.setAttribute("id", `model-${toy.id}`);
          model.setAttribute("position", toy.model_geometry.position);
          model.setAttribute("rotation", toy.model_geometry.rotation);
          model.setAttribute("scale", toy.model_geometry.scale);
          model.setAttribute("visible",true)
          var descContainer = document.querySelector(`#main-plane-${toy.id}`)
          descContainer.setAttribute("visible",true)
    
          var pricePlane = document.querySelector(`#price-plane-${toy.id}`)
          pricePlane.setAttribute("visible",true)
        }
        // Changing button div visibility
        var buttonDiv = document.getElementById("button-div");
        buttonDiv.style.display = "flex";
    
        var ratingButton = document.getElementById("rating-button");
        var orderButtton = document.getElementById("order-button");
    
        // Handling Click Events
        ratingButton.addEventListener("click", function () {
          swal({
            icon: "warning",
            title: "Rate Toy",
            text: "Work In Progress"
          });
        });
    
        orderButtton.addEventListener("click", () => {
          var uNumber;
          userNumber <= 9 ? (uNumber = `U0${userNumber}`) : `U${userNumber}`;
          this.handleOrder(uNumber, toy);

          swal({
            icon: "https://i.imgur.com/4NZ6uLY.jpg",
            title: "Thanks For Order !",
            text: "Your order arrive soon >:(",
            timer: 2000,
            buttons: false
          });
        });

        var toy = toys.filter(toy => toy.id === markerId)[0];
    
        var model = document.querySelector(`#model-${toy.id}`);
        model.setAttribute("position", toy.model_geometry.position);
        model.setAttribute("rotation", toy.model_geometry.rotation);
        model.setAttribute("scale", toy.model_geometry.scale);
      },

      getOrderSummary:async function(uNumber){
        return await firebase.firestore().collection("users").doc(uNumber).get().then(doc=>doc.data())
          },
        
          handleOrderSummary:async function(){
        var uNumber
        userNumber <= 9 ? (uNumber = `U0${userNumber}`) : `T${userNumber}`
        var orderSummary = await this.getOrderSummary();  
        var modalDiv = document.getElementById("modal-div")
        modalDiv.style.display = "flex"
        var userBodyTag = doucment.getElementById("bill-user-body")
        userBodyTag.innerHTML = ""
        var currentOrders = Object.keys(orderSummary.currentOrders)
        currentOrders.map(i=>{
          var tr = document.createElement("tr")
          var item = document.createElement("td")
          var price = document.createElement("td")
          var quantity = document.createElement("td")
          var subtotal = document.createElement("td")
          item.innerHTML = orderSummary.current_orders[i].item
          price.innerHTML = "$"+orderSummary.current_orders[i].price
          price.setAttribute("class","text-center")
          quantity.innerHTML = orderSummary.current_orders[i].quantity
          quantity.setAttribute("class","text-center")
          subtotal.innerHTML = "$"+orderSummary.current_orders[i].subtotal
          subtotal.setAttribute("class","text-center")
        
          tr.appendChild(item)
          tr.appendChild(price)
          tr.appendChild(quantity)
          tr.appendChild(subtotal)
        
          userBodyTag.appendChild(tr)
        })
        var totalTr = document.createElement("tr")
        var td1 = document.createElement("td")
        td1.setAttribute("class","no-line")
        var td2 = document.createElement("td")
        td2.setAttribute("class","no-line")
        var td3 = document.createElement("td")
        td3.setAttribute("class","no-line")
        
        var strongtag = document.createElement("strong")
        strongtag.innerHTML = "Total"
        
        td3.appendChild(strongtag)
        
        var td4 = document.createElement("td")
        td4.setAttribute("class","no-line text-right")
        td4.innerHTML = "$"+orderSummary.total_bill
        
        totalTr.appendChild(td1)
        totalTr.appendChild(td2)
        totalTr.appendChild(td3)
        totalTr.appendChild(td4)
        
        userBodyTag.appendChild(totalTr)
        
          },
        
          handleOrder: function (uNumber, toy) {
            // Reading current user order details
            firebase
              .firestore()
              .collection("users")
              .doc(uNumber)
              .get()
              .then(doc => {
                var details = doc.data();
        
                if (details["current_orders"][toy.id]) {
                  // Increasing Current Quantity
                  details["current_orders"][toy.id]["quantity"] += 1;
        
                  //Calculating Subtotal of item
                  var currentQuantity = details["current_orders"][toy.id]["quantity"];
        
                  details["current_orders"][toy.id]["subtotal"] =
                    currentQuantity * toy.price;
                } else {
                  details["current_orders"][toy.id] = {
                    item: toy.toy,
                    price: toy.price,
                    quantity: 1,
                    subtotal: toy.price * 1
                  };
                }
        
                details.total_bill += toy.price;
        
                //Updating db
                firebase
                  .firestore()
                  .collection("users")
                  .doc(doc.id)
                  .update(details);
              });
          },

    handleMarkerLost:function(){
        var buttondiv = document.getElementById("button-div")
        buttondiv.style.display = "none"
    },
    getToys:async function(){
        return await firebase.firestore().collection("toys").get().then(snap=>{
            return snap.docs.map(doc=>doc.data())
        })
           }

})