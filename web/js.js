
$(document).ready(function(){

    const maxvaluehud = $("#healths").css("height")
    const maxcarvaluehud = $("#fuels").css("height")
    var hidden = true 
    var color =  localStorage.getItem("color") ? localStorage.getItem("color") : "#0058FF"
    var iconcolor = localStorage.getItem("iconcolor") ? localStorage.getItem("iconcolor") : "#00FF00"
    var showmax = false
    var position = 0
    var incar = false

    function rpm(a) {
        const $rpmsElement = $("#rpms");
        $rpmsElement.empty();  
        for (let i = 0; i < a && i < 25; i++) {
            $rpmsElement.append(`<div class="rpm" style="background-color:${localStorage.getItem("color")};"></div>`);
        }
        const $rpmElements = $(".rpm");
        if ($rpmElements.length === 25) {
            let isRed = false;
            let intr;
            intr = setInterval(function() {
                if ($(".rpm").length < 25) {
                    clearInterval(intr); 
                    intr = null; 
                    return; 
                }
    
                $rpmElements.each(function() {
                    $(this).css("opacity", isRed ? "0.0" : "1.0");
                });
    
                isRed = !isRed;
            }, 100);
        }
    }
    

    function setspeed(speed) {
        const $speedoElement = $("#speedo");
        
        $speedoElement.html(speed); 

        $speedoElement.css({
            "fontFamily": "'Uni Sans Demo', sans-serif",
            "fontWeight": "800",
            "textAlign": "center"
        });
    }
    async function locale(key) {
        try {
            const response = await fetch(`https://${GetParentResourceName()}/getLocale`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify({
                    key: key
                })
            })
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }
            const data = await response.json()
            return data
        } catch (error) {
            console.log('Error:', error)
            throw error
        }
    }
    function updateShowFullStatus(isChecked) {
        showmax = isChecked;
        const backgroundColor = isChecked ? localStorage.getItem("color") : '#222222';
    
        $("#showfullcheck").css("backgroundColor", backgroundColor);
        $(".slider").first().css("backgroundColor", backgroundColor);
    }
    function hidehud(type) {
        const $parent = $("#" + type).parent();
        $parent.css("opacity", 0);
        
        setTimeout(() => {
            $parent.css("display", "none");
        }, 50);
    }
    
    function showhud(type) {
        const $parent = $("#" + type).parent();
        $parent.css("display", "block");
        
        setTimeout(() => {
            $parent.css("opacity", 1);
        }, 50);
    }
    
    function updatehud(type, value) {
        const $element = $("#" + type);
        const $parent = $element.parent();
        
        if (value < 0) {
            value = 0;
        }
        
        if (type === "shields" || type === "mics") {
            if (value > 0) {
                if (value > 95) {
                    value = 100;
                }
                $parent.css("display", "block");
                setTimeout(() => { $parent.css("opacity", 1); }, 10);
            } else {
                if (!showmax) {
                    hidehud(type);
                }
            }
        } else if (type === "oxygens") {
            if (value === 100) {
                hidehud(type);
            } else {
                showhud(type);
            }
        } else {
            if (showmax || value < 95) {
                showhud(type);
            } else {
                hidehud(type);
            }
        }
    
        $element.css("height", parseInt(maxvaluehud) * (value / 100) + "px");
    }   
    function updatecarhud(type, value) {
        const $element = $("#" + type);
        const $parent = $element.parent();
        
        if (value < 0) {
            value = 0;
        }
    
        $element.css("height", parseInt(maxcarvaluehud) * (value / 100) + "px");
    }
    
    function talking(value) {
        const $mic = $("#mic");
    
        if (value) {
            $mic.css("transform", "scale(1.1)");
        } else {
            $mic.css("transform", "scale(1.0)");
        }
    }
    

    $("#showfullcheck").click(function () {
        updateShowFullStatus(this.checked)
    })
    $("#position1").click(function () {
        $("#main").css({
            "flexDirection": "row",
            "right": "0.5vw",
            "borderTopRightRadius": "1.04vh",
            "borderBottomRightRadius": "1.04vh",
            "transform": "translateY(0%)"
        });
        position = 0;
        if (incar) {
            $("#main").css("bottom", "10vh");
        } else {
            $("#main").css("bottom", "0.4%");
        }
        localStorage.setItem("pos", position);
    });
    
    $("#position2").click(function () {
        $("#main").css({
            "flexDirection": "column",
            "bottom": "50%",
            "right": "0vw",
            "borderTopRightRadius": "0vh",
            "borderBottomRightRadius": "0vh",
            "transform": "translateY(50%)"
        });
        position = 1;
        localStorage.setItem("pos", position);
    });
    $("#apply").click( function () {
        $("#setting").css("display", "none");
    
        $.post(`https://${GetParentResourceName()}/closesettings`, JSON.stringify({
            color: localStorage.getItem("color"),
            iconcolor: localStorage.getItem("iconcolor")
        }));
    });

    window.addEventListener('message', (event) => {
        let data = event.data;
    
        if(data.type == 'update') {
            updatehud("healths", data.data[0]);
            updatehud("shields", data.data[1]);
            updatehud("foods", data.data[2]);
            updatehud("waters", data.data[3]);
            updatehud("oxygens", data.data[4] * 10);
        } else if(data.type == 'groups') {
            if (data.data[0] === undefined) {
                $("#grouplista").css("right", "-55.5vw");
                return;
            }
            $("#grouplista").css("right", "0");
            data.data[0]["name"] = data.data[0]["name"] + " (HOST)";
            data.data.forEach(element => {
                $("#job").text(element.job);
            });
    
            $("#memberlist").empty();
            data.data.forEach(element => {
                $("#memberlist").append(`<li>${element.name}</li>`);
            });
        } else if(data.type == "updatecarhud") {
            $("#metrics").html(data.metrics);
            setspeed(Math.round(data.speed));
            rpm(data.rpms * 1.3);
            $("#street").text(data.road);
            $("#compasssq").text(data.compass);
            updatecarhud("fuels", data.fuel);
        } else if(data.type == "updatebelt") {
            if (data.belticon) {
                $("#backbelt").show();
                $("#carhud").css("gridTemplateColumns", "25% 45% auto");
    
                if (data.belt) {
                    $("#backbelt").css("transform", 'scale(1.0)');
                    $("#belt").css("backgroundColor", localStorage.getItem("color"));
                    $("#belticon").css("fill", localStorage.getItem("iconcolor"));
                } else {
                    $("#belt").css("backgroundColor", localStorage.getItem("iconcolor"));
                    $("#belticon").css("fill", localStorage.getItem("color"));
                    setTimeout(() => {
                        $("#backbelt").css("transform", 'scale(1.2)');
                    }, 400);
                    $("#backbelt").css("transform", 'scale(1.0)');
                }
            } else {
                $("#carhud").css("gridTemplateColumns", '25% 60% auto');
                $("#backbelt").hide();
            }
        } else if(data.type == "showhud") {
            if (hidden) {
                hidden = false;
                $("#hud").css("display", "flex");
                setTimeout(() => {
                    if (position == 0) {
                        $("#main").css("right", "0.5vw");
                    } else {
                        $("#main").css("right", "0.0vw");
                    }
                    $("#carhud, #compass, #streetname").css("right", "0.5vw");
                }, 600);
            }
        } else if(data.type == "hidehud") {
            if (!hidden) {
                hidden = true;
                $("#main, #carhud, #compass, #streetname").css("right", "-55.5vw");
                setTimeout(() => {
                    $("#hud").css("display", "none");
                }, 600);
            }
        } else if(data.type == "updatemic") {
            updatehud("mics", data.voiceMode);
        } else if (data.type == "updatemicstatus") {
            talking(data.status);
        } else if(data.type == "showcarhud") {
            if (data.data) {
                incar = true;
                $("#carhudcontainer").css("display", "flex");
                if (position == 0) {
                    $("#main").css("bottom", "10vh");
                }
                setTimeout(() => {
                    $("#carhud, #compass, #streetname").css("right", "0.5vw");
                }, 600);
            } else {
                incar = false;
                if (position == 0) {
                    $("#main").css("bottom", "0.69vh");
                }
                $("#carhud, #compass, #streetname").css("right", "-55.5vw");
                setTimeout(() => {
                    $("#carhudcontainer").css("display", "none");
                }, 600);
            }
        } else if(data.type == "opensettings") {
            $("#setting").css("display", data.open ? "flex" : "none");
        } else if (data.type == "setup") {
            const localeKeys = ['apply', 'hudcolor', 'iconcolor', 'showfull', 'hudpos', 'vert', 'hor'];
            localeKeys.forEach(key => {
                locale(key).then(data => {
                    $("#" + key).html(data);
                }).catch(error => {
                    console.log('Error fetching locale:', error);
                });
            });
    
            const pickr = Pickr.create({
                el: '#color-picker-container',
                theme: 'nano',
                defaultRepresentation: 'HEX',
                comparison: false,
                default: localStorage.getItem("color"),
                components: {
                    preview: true,
                    hue: true,
                }
            });
    
            pickr.on('change', (color, source, instance) => {
                const selectedColor = color.toHEXA().toString();
                $("#showfullcheck, .slider, .backcolor").css("backgroundColor", selectedColor);
                $(".textcolor").css("color", selectedColor);
                localStorage.setItem("color", selectedColor);
            });
    
            const pickr2 = Pickr.create({
                el: '#icon-color-picker-container',
                theme: 'nano',
                defaultRepresentation: 'HEX',
                comparison: false,
                default: localStorage.getItem("iconcolor"),
                components: {
                    preview: true,
                    hue: true,
                }
            });
    
            pickr2.on('change', (color, source, instance) => {
                const selectedColor = color.toHEXA().toString();
                $("body").css("color", selectedColor);
                $("#belticon").css("fill", selectedColor);
                localStorage.setItem("iconcolor", selectedColor);
            });
    
            color = localStorage.getItem("color");
            iconcolor = localStorage.getItem("iconcolor");
            position = localStorage.getItem("pos");
    
            $("#belticon").css("fill", iconcolor);
            $("body").css("color", iconcolor);
            if (position == 0) {
                $("#position1").prop("checked", true);
                $("#position2").prop("checked", false);
                $("#main").css({
                    "flexDirection": "row",
                    "transform": "translateY(0%)",
                    "right": "0.5vw",
                    "borderTopRightRadius": "1.04vh",
                    "borderBottomRightRadius": "1.04vh",
                    "bottom": incar ? "10vh" : "0.4%"
                });
                localStorage.setItem("pos", position);
            } else if (position == 1) {
                $("#position1").prop("checked", false);
                $("#position2").prop("checked", true);
                $("#main").css({
                    "flexDirection": "column",
                    "bottom": "50%",
                    "right": "0vw",
                    "borderTopRightRadius": "0vh",
                    "borderBottomRightRadius": "0vh",
                    "transform": "translateY(50%)"
                });
                localStorage.setItem("pos", position);
            }
    
            $(".rpm").css("backgroundColor", localStorage.getItem("color"));
            $(".backcolor").css("backgroundColor", color);
            $(".textcolor").css("color", color);
            $.post(`https://${GetParentResourceName()}/closesettings`, JSON.stringify({
                color: localStorage.getItem("color"),
                iconcolor: localStorage.getItem("iconcolor")
            }));
        }
    });
})    
