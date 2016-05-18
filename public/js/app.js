//make ajax call to hide the user and password.

var action;

       $(document).ready(function(){
         $('#loginButton').on("click", function(){
           action = "gethours";

           //this allows me to update the database correctly. but the user and password will be shown. 
           //window.location = '/gethours/' + $('#user').val() + '/' + $('#pass').val();
          //    console.log("login");
         //


         //try to use the ajax call to play around with the username and password hiding feature. Somehow messed up with the
         //savehours function, only the url is updated, not the database.
           $.ajax({
               type: "GET",
               url: action +'/'+ $('#user').val() + '/' + $('#pass').val(),
               success: function(response){
                 console.log(response);

                    $(".welcome").html(response);


               }
           });
         });





       });
