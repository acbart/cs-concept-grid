concepts = {}
concept_ids = {}

function unsetConcept(id) {
    name = concept_ids[id];
    delete concepts[name];
    $("#concept-" + id).remove();
}

function resizeCSGrid() {
    $(".cs-grid").height($(window).height());
    origin = getBoundingBox(".cs-grid");
    for (concept in concepts) {
        if (concepts[concept].dropped) {
            ref = concepts[concept].ref;
            self = getBoundingBox(ref);
            $(ref).offset({"left": origin.x + concepts[concept].x * origin.width - self.width/2,
                           "top": origin.y + concepts[concept].y * origin.height - self.height/2});
        }
    }
}

function getBoundingBox(obj) {
    return {"x" : $(obj).offset().left,
            "y" : $(obj).offset().top,
            "width" : $(obj).width(),
            "height" : $(obj).height()};
}

function buildConceptDialog() {
    $('#concept-dialog-delete').button();
    $("#concept-dialog").dialog({
        autoOpen: false,
        title: "Unknown",
        dialogClass: 'noTitleStuff',
        buttons: [
            {text : "Delete", 
             priority: 'secondary', 
             "class": "btn btn-danger", 
             click: function() {
                id =  $("#concept-dialog").attr("concept-id");
                unsetConcept(id);
                $(this).dialog("close");
            }},
            {text : "Cancel", click: function() {
                $(this).dialog("close");
            }},
            {text : "Okay", click: function() {
                id =  $("#concept-dialog").attr("concept-id");
                name = concept_ids[id];
                concepts[name].comment = $("#concept-dialog textarea").val();
                $(this).dialog("close");
            }}
        ]
    });
}

function createNewDraggableConcept(name, id, comment) {
    concept_ids[id] = name;
    concepts[name] = {"ref": "#concept-"+id,
                      "x": 0,
                      "y": 0,
                      "set": false,
                      "name": name,
                      "id": id,
                      "comment": comment};
    concept = $("<span id='concept-"+id+"' class='concept'>"+name+"</span>");
    concept.draggable({
        distance: 10,
        scroll: false,
        start: function() {
            
        },
        drag: function() {
            $(this).css({"font-weight": "bold"});
        },
        stop: function() {
            $(this).css({"font-weight": "normal"});
            self = getBoundingBox(this);
            origin = getBoundingBox(".cs-grid");
            newX = self.x;
            newY = self.y;
            x = (self.x - origin.x) - self.width / 2;
            y = (self.y - origin.y) - self.height / 2;
            if (x < 0) {
                newX = origin.x;
            }
            if (y < 0) {
                newY = origin.y;
            }
            if (x > origin.width - self.width) {
                newX = origin.x + origin.width - self.width;
            }
            if (y > origin.height - self.height) {
                newY = origin.y + origin.height - self.height;
            }
            if (newX != x || newY != y) {
                $(concepts[name].ref).appendTo(".cs-grid");
                $(this).offset({"top": newY, "left": newX});
            }
            self = getBoundingBox(this);
            concepts[name].x = (self.x - origin.x + self.width/2) / origin.width;
            concepts[name].y = (self.y - origin.y + self.height/2) / origin.height;
            concepts[name].dropped = true;
        }});
    concept.dblclick(function() {
        if (concepts[name].dropped) {
            $("#concept-dialog").dialog("option", "title", name);
            $("#concept-dialog").dialog("option", "position", {
                "my" : "right-10% bottom-10%",
                "of": "horizontal",
                "collision": "flip",
                "of" : concepts[name].ref
            });
            $("#concept-dialog textarea").val(concepts[name].comment);
            $("#concept-dialog").attr("concept-id", id);
            $("#concept-dialog").dialog("open");
        }
    });
    concept.css({"position": "absolute"});
    $("#concepts").append(concept);
}

$(document).ready(function() {
    window.onresize = resizeCSGrid;
    resizeCSGrid();
    buildConceptDialog();
    createNewDraggableConcept("Closures", 1, "My comment");
    createNewDraggableConcept("Pointers", 100, "A longer comment");
    createNewDraggableConcept("Reading from a file", 77, "This is a much much longer comment. It should be just enough. This is a much much longer comment. It should be just enough.");
    createNewDraggableConcept("Local variables vs. global variables", 870, "");
    createNewDraggableConcept("Local variables vs. global variable", 871, "");
    createNewDraggableConcept("Local variables vs. global", 872, "");
    createNewDraggableConcept("Local variables vs.", 873, "");
    createNewDraggableConcept("Local varia", 874, "");
});