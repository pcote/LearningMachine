// Handles the adding events for when users add exercises, click on them, and push buttons that
// rate how they felt they did.
var ExerciseController = function(exerciseService){

    var ec = this;

    // The currently "active" variables used to help set up lists, add new info, ect.
    ec.activeObject = {};
    ec.activeObject.exercise = {"id": 0, "question": "blank question", "answer": "blank answer"};

    // Item lists to display on different parts of the page
    ec.dataList = {};
    ec.dataList.exercises = [];
    ec.dataList.resources = [];

    // Corresponds to input fields when
    // adding new flashmarks or learning resources.
    ec.newinfo = {};
    ec.newinfo.question = "";
    ec.newinfo.answer = "";
    ec.newinfo.caption = "";
    ec.newinfo.url = "";

    // Corresponds to character counting fields so user knows how close to
    // 140 character limit they are.
    ec.charsleft = {};
    ec.charsleft.question = "";
    ec.charsleft.answer = "";
    ec.charsleft.caption = "";
    ec.charsleft.url = "";



    // Callback function for populating the exercise list in response to a promise
    // for getting said exercises being fullfilled.
    var getExercisesSuccess = function(res){
         ec.dataList.exercises = res.data.exercises;
    };

    var getExercisesFailure = function(res){
    };


    var promise = exerciseService.getExercises();
    promise.then(getExercisesSuccess, getExercisesFailure);



    // add an exercise and update exercise display.  Clear out the exercise addition form and show the latest questions
    // when done.
    ec.addExerciseClick = function(newQuestion, newAnswer){

        var successCallback = function(res){
            var promise = exerciseService.getExercises();
            promise.then(getExercisesSuccess, getExercisesFailure);
        };

        var failureCallback = function(res){};

        var addExercisePromise = exerciseService.addExercise(newQuestion, newAnswer);
        addExercisePromise.then(successCallback, failureCallback);
        ec.newinfo.question = "";
        ec.newinfo.answer = "";
        $("#addExerciseModal").modal("hide");
    };


    // Make sure the right questions show up in the question box.
    ec.exerciseClick = function(exercise){
        ec.activeObject.exercise = exercise;
        $("#questionModal").modal();
    };


    // When user clicks "show answer" in the question box, show the answer in a display they can rate themselves on.
    ec.showAnswerClick = function(){
        $("#questionModal").modal("hide");
        $("#questionAnswerModal").modal();
    };


    // Handle a user rating themselves.  Here, just send the rating to the server
    // and make the question answer box go away.
    ec.scoreClick = function(score){
        var scoreSubmissionPromise = exerciseService.submitScore(ec.activeObject.exercise, score);
        $("#questionAnswerModal").modal("hide");

        scoreSubmissionPromise.then(function(res){
            var promise = exerciseService.getExercises();
            promise.then(getExercisesSuccess);
        });

    };

    // When user hits the delete button for an exercise, call on service to
    // get rid of the exercise in question.  Then revise the exercise list.
    ec.deleteExerciseClick = function(exercise_id){
        var successCallback = function(res){
            var promise = exerciseService.getExercises();
            promise.then(getExercisesSuccess, getExercisesFailure);
        };

        var failureCallback = function(res){
            alert("Deletion attempt failed: " + res.data);
        };

        var deleteExercisePromise = exerciseService.deleteExercise(exercise_id);
        deleteExercisePromise.then(successCallback, failureCallback)
    };

    // When user clicks the button to show existing resources for a specific exercise,
    // open that dialog and call service to get the items to populate it with.
    ec.resourceButtonClick = function(exercise){

        var successCallback = function(res){
            ec.dataList.resources = res.data.resources;
            $("#resourceListId").modal();
        };
        var failureCallback = function(res){};

        ec.activeObject.exercise = exercise;
        var promise = exerciseService.reviseLearningResourceList(exercise.id);
        promise.then(successCallback, failureCallback);

    };

    // When user clicks the button to add a resource, close the learning resource list and
    // open the dialog for creating a new learning resource.
    ec.resourceListToResourceModalClick = function(){
        $("#resourceListId").modal("hide");
        $("#addResourceModal").modal();

        var hideAddResourceModal = function(evt){
            ec.newinfo.caption = "";
            ec.newinfo.url = "";
        };

        $("#addResourceModal").on("hide.bs.modal", hideAddResourceModal);
    };

    // In the 'learning resources' box for a new exercise, user hits the okay button and
    // , for that, system submits a new learning resource, gets an update on learning resource list, and blanks
    // the dialog inputs.
    ec.addLearningResourceClick = function(new_cap, new_url){

        var successCallback = function(res){
            var getResourceSuccess = function(res){
                ec.dataList.resources = res.data.resources;
            };

            var promise = exerciseService.reviseLearningResourceList(ec.activeObject.exercise.id);
            promise.then(getResourceSuccess);
        };

        var failureCallback = function(res){
            alert("failure in adding the resource");
        };

        var promise = exerciseService.addLearningResource(new_cap, new_url, ec.activeObject.exercise.id);
        promise.then(successCallback, failureCallback);

        ec.newinfo.caption = "";
        ec.newinfo.url = "";
        $("#addResourceModal").modal("hide");

    };

    // When the user clicks the delete button on a learning resource for an exercise, call on the server
    // to remove the connection to that exercise... then bring that learning resource list up to date.
    ec.deleteLearningResourceClick = function(resource_id){

        var success = function(res){
            var resourceSuccess = function(res){
                ec.dataList.resources = res.data.resources;
            };

            var promise = exerciseService.reviseLearningResourceList(ec.activeObject.exercise.id);
            promise.then(resourceSuccess);
        };

        var failure = function(res){
            alert("failure in deleting the resource");
        };

        var promise = exerciseService.deleteLearningResource(resource_id);
        promise.then(success, failure);
    };

    // As the user types into a field box (of any kind), update user to make sure that there is a display
    // that says how close the user is to their 140 character limit.
    ec.updateCharsLeft = function(fieldName, charsLeftDisplay){
        var charsLeft = 140;
        var message = "";

        if(fieldName === "newQuestion"){
            charsLeft = 140 - ec.newinfo.question.length;
        }
        else if(fieldName === "newAnswer"){
            charsLeft = 140 - ec.newinfo.answer.length;
        }
        else if(fieldName === "new_caption_field"){
            charsLeft = 140 - ec.newinfo.caption.length;
        }
        else if(fieldName === "new_url_field"){
            charsLeft = 140 - ec.newinfo.url.length;
        }

        message = charsLeft + " characters left";

        if(charsLeftDisplay === "questionCharsLeft"){
            ec.charsleft.question = message;
        }

        else if(charsLeftDisplay === "answerCharsLeft"){
            ec.charsleft.answer = message;
        }

        else if(charsLeftDisplay === "captionCharsLeft"){
            ec.charsleft.caption = message;
        }

        else if(charsLeftDisplay === "urlCharsLeft"){
            ec.charsleft.url = message;
        }

    };

    // When the 'all tags' button gets clicked on an exercise,
    // give the user the full list of every exercise they have.
    ec.allTagsClick = function(){
        var promise = exerciseService.getExercises();
        promise.then(getExercisesSuccess, getExercisesFailure);
    };

    // When the user clicks 'change tags' for an exercise, pop up
    // a dialog pre-populated with existing tag names which the user is free to change.
    ec.changeTagsClick = function(exercise){
        ec.activeObject.exercise = exercise;
        var tagsAsString = exercise.tags.join(" ");
        $("#tfChangeTags").val(tagsAsString);
        $("#changeTagsModal").modal();
    };

    // When user hits OK in the "change tags dialog", sends out a request to update
    // the tag associations for that exercise.  Then gets a fresh set of exercises to display.
    ec.commitTagChanges = function(exercise, tagChanges){

        var success = function(res){
            var promise = exerciseService.getExercises();
            promise.then(getExercisesSuccess, getExercisesFailure);
        };

        var failure = function(res){
            alert(res.data);
        };


        var promise = exerciseService.changeTags(exercise.id, tagChanges);
        $("#changeTagsModal").modal("hide");
        promise.then(success, failure);
    };

    // Handle clicks on a user-created topic tag where the system responds
    // with a new set of exercises, each of which also have that tag.
    ec.tagNameClick = function(exerciseID, tagName){
        var promise = exerciseService.getExercisesByTag(tagName);
        promise.then(getExercisesSuccess, getExercisesFailure);
    };

    // Handle pasting of a URL into the "new learning resource box".
    // That way, it can go find a title to suggest for the new resource.
    ec.pasteUrlHandler = function(evt){
        var suggestionSuccess = function(res){
            var suggestedTitle = res.data;
            ec.newinfo.caption = suggestedTitle;
        };

        var suggestionFailure = function(res){
            alert(res.data);
        };

        var clipboardData = evt.originalEvent.clipboardData;
        var data = clipboardData.getData("text/plain");
        data = data.trim();
        var promise = exerciseService.getSuggestedTitle(data);
        promise.then(suggestionSuccess, suggestionFailure);
    };


};

// Exercise Display Directive - Component that handles display of exercises as well as any operations that are done
// on an exercise list.
var exerciseDisplay = function(){
    var d = {};
    d.restrict = "E";
    d.scope = {
        show: "="
    };
    d.templateUrl = "/static/exercise_display/exercise_display.html";
    d.controller = "ExerciseController";
    d.controllerAs = "ec";
    return d;
};

var lmSearchFilter = function() {
    var search = function(exerciseList, dummyarg){
        console.log("okay so far");
        console.log("filter arg is: " + dummyarg);
        return exerciseList;
    };

    return search;
}