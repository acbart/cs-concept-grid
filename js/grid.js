concepts = {}
function encodeConcept(concept) {
    return concept.replace(" ", "_");
}
function decodeConcept(concept) {
    return concept.replace("_", " ");
}

function resizeCSGrid() {
    $(".cs-grid").height($(window).height());
    origin = getBoundingBox(".cs-grid");
    for (concept in concepts) {
        ref = concepts[concept].ref;
        self = getBoundingBox(ref);
        $(ref).offset({"left": origin.x + concepts[concept].x * origin.width - self.width/2,
                       "top": origin.y + concepts[concept].y * origin.height - self.height/2});
    }
}

function getBoundingBox(obj) {
    return {"x" : $(obj).offset().left,
            "y" : $(obj).offset().top,
            "width" : $(obj).width(),
            "height" : $(obj).height()};
}

function createNewDraggableConcept(name) {
    concept = $("<span id='concept-"+encodeConcept(name)+"' concept-name='"+name+"' class='concept'>"+name+"</span>");
    concept.draggable({
        distance: 10,
        scroll: false,
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
                $(this).offset({"top": newY, "left": newX});
            }
            self = getBoundingBox(this);
            concepts[name] = {"x": (self.x - origin.x + self.width/2) / origin.width,
                              "y": (self.y - origin.y + self.height/2) / origin.height,
                              "ref": "#concept-"+encodeConcept(name)};
            console.log(concepts[name])
        }});
    $("#new-concepts").append(concept);
}

$(document).ready(function() {
    window.onresize = resizeCSGrid;
    resizeCSGrid();
    createNewDraggableConcept("Closures");
    $(".cs-grid").click(function (event) {
        console.log(event.offsetX);
        console.log(event.offsetY);
    });
});