(function() {

    Vue.component("magnified-image",{
        props:["id"],
        template: "#show-image",
        data: function(){
            return {
                image: "",
                title: "",
                description: "",
                username: "",
                commentUsername: "",
                comment:"",
                comments:[]
            };
        },
        watch:{
            id: function(){
                var component = this;
                axios.get("/single-image/" + this.id).then(function(response){
                    if(!response.data.image){
                        component.$emit("closing");
                        location.hash="";
                        return;
                    }
                    component.title = response.data.image.title,
                    component.image = response.data.image.image,
                    component.description = response.data.image.description,
                    component.username = response.data.image.username,
                    component.comments = response.data.comments;
                });
            }
        },
        methods: {
            submitComment: function(e){
                var component = this;
                e.preventDefault();
                axios.post("/comment/" + this.id, {
                    comment:this.comment,
                    username:this.commentUsername
                }).then(results=>{
                    this.comments.unshift(results.data.results);
                    component.comment = "";
                    component.commentUsername="";
                });
            },
            close: function(){
                this.$emit("closing");
                location.hash="";
            },
        },
        mounted: function (){
            var component = this;
            axios.get("/single-image/" + this.id).then(function(response){
                if(!response.data.image){
                    component.$emit("closing");
                    location.hash="";
                    return;
                }
                component.title = response.data.image.title,
                component.image = response.data.image.image,
                component.description = response.data.image.description,
                component.username = response.data.image.username,
                component.comments = response.data.comments;

            });
        }
    });

    new Vue({
        el: "#main", // the html element where our app will load
        data: {
            heading: "My Image Board",
            headingClassName: "heading",
            images: [],
            selectedImage: location.hash.slice(1) || null,
            lastImageId: "",
            formStuff: {
                title: "",
                description: "",
                username: "",
                file: void 0
            }
        },
        methods: {
            handleChange: function(e) {
                this.formStuff.file = e.target.files[0];
            },
            handleSubmit: function(e) {
                e.preventDefault();
                const formData = new FormData();
                formData.append("file", this.formStuff.file);
                formData.append("title", this.formStuff.title);
                formData.append("description", this.formStuff.description);
                formData.append("username", this.formStuff.username);

                axios.post("/upload", formData).then(results => {
                    this.images.unshift(results.data.results);
                    this.formStuff.title="";
                    this.formStuff.description="";
                    this.formStuff.username="";
                    this.formStuff.file= void 0;
                    //unshift the new image into this.image, to add the picture at the beggining of the array
                    //shift, unshift, pop and push methods to change arrays
                });
            },
            showModal: function(id){
                this.selectedImage = id;
            },

            closeModal: function(){
                this.selectedImage = null;
            },
            getMoreImages: function(){
                var app= this;
                axios.get("/more-images/" + app.lastImageId).then(function(response){
                    console.log("response ", response.data.images);
                    console.log("this.images ", app.images);
                    app.images.push.apply(app.images, response.data.images);
                    app.lastImageId = app.images[app.images.length-1].id;

                });


            }
        },
        mounted: function() {
            //runs the function when the app is loaded
            var app = this;
            window.addEventListener("hashchange", function(){
                app.selectedImage = location.hash.slice(1);
            });
            axios.get("/images").then(function(response) {
                app.images = response.data.images;
                app.lastImageId = app.images[app.images.length-1].id;
            });
        }
    });

})();




// SELECT*FROM images WHERE  id <$1 ORDER BY id DESC
// //grab the id of the last images in the list (this.images.length -1)
// //reaching the extended - get out the more button
// as long as the id>1 , show the more button, else delete
// stop listening to the scroll (for infinite scroll)
//
// document.body.scrollHeight
// document.body.scrollTop
// window.innerHeight
// overscroll: flow
//
//
// Part 4 - client side routing
// //using a library
// //# (hash) never goes the server, but they do create client history
//
// //detect whener hash changes
//
// window.hashchange
// mounted: function(){
// var app = this
// addEventListener("hashchange", function(){
// app.selectedImage = location.hash.slice(1);
//
// })
// }
//
// //remove the click handler from the images
// //put the image in a link
// <a v-bind:href=''"#" + image.id'><img v-bind:src="image.image"></a>
//
//
// //watchers
// //create a property on the component named watched
