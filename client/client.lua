ESX = exports.es_extended:getSharedObject()
local directions = {"N", "NE", "E", "SE", "S", "SW", "W", "NW"}
local hudState = false
local inVeh = false
local started = false
local color = "#0058FF"
local iconcolor = "#FFFFFF"
local shown = false
local hidden = false

RegisterNUICallback('getLocale', function(data, cb)
    local key = data.key

    cb(locale(key))
end)
RegisterNetEvent('esx:playerLoaded')
AddEventHandler('esx:playerLoaded', function()
    lib.locale()

    
    SetupHud()
end)

Citizen.CreateThread(function()
    lib.locale()

    SetupHud()
end)

function SetupHud()
    Citizen.Wait(1000)
    SendNUIMessage({
        type = 'setup',
    })    
    DisplayRadar(false)
    SetRadarBigmapEnabled(true, false)
    Wait(100)
    SetRadarBigmapEnabled(false, false)
    SendNUIMessage({action = 'showhud', state = true})
    hudState = true
    SendNUIMessage({
        type = 'updatecarhud',
        carhud = inVeh,
    })          

    if (not started) then
        started = true
    end
    Citizen.CreateThread(function()
        local minimap = RequestScaleformMovie("minimap")
        SetRadarBigmapEnabled(true, false)
        Wait(0)
        SetRadarBigmapEnabled(false, false)
        while true do
            Wait(500)
            BeginScaleformMovieMethod(minimap, "SETUP_HEALTH_ARMOUR")
            ScaleformMovieMethodAddParamInt(3)
            EndScaleformMovieMethod()
        end
    end)
    Citizen.CreateThread(function()
        while true do
            Citizen.Wait(500)
            local talking = NetworkIsPlayerTalking(cache.playerId)
            SendNUIMessage({
                type = "updatemicstatus",
                status = talking,
            })
            SendNUIMessage({
                type = 'updatebelt',
                belticon = Config.seatbelt,
                belt = Config.seatbeltgetter(),

            })
        end
    end)
end

function hidehud()
    hidden = true
    SendNUIMessage({
        type = "hidehud",
    })
    SendNUIMessage({
        type = "opensettings",
        open = false,
    })
end
RegisterCommand("togglehud", function()
    ToggleHUD()
end,false)

RegisterKeyMapping("togglehud", "Przełącz HUD", "mouse_button", "MOUSE_MIDDLE")
AddEventHandler('esx:pauseMenuActive', function(isActive)
    hidehud()
end)

function showhud()

    hidden = false
    SendNUIMessage({
        type = "showhud",
    })
end

function getColor()

    return {color, iconcolor}
end



function ToggleHUD()
    if hudState then
        hudState = not hudState
        showhud()
        if inVeh then
            SendNUIMessage({
                type = "showcarhud",
                data = inVeh,
            })
        end
    else
        hudState = not hudState
        hidehud()
    end
end
local voiceMode = 2
local voiceModes = {}
local usingRadio = false

RegisterCommand("hud", function ()
    showhud()
    SetNuiFocus(true,true)
    SendNUIMessage({
        type = "opensettings",
        open = true,
    })
end, false)

RegisterNUICallback("closesettings", function(data, cb)
    color = data.color
    iconcolor = data.iconcolor
    SetNuiFocus(false,false)

    cb()
end)

AddEventHandler('esx_status:onTick', function(data)


    local heading = GetEntityHeading(cache.ped)
    local hp = math.floor((GetEntityHealth(cache.ped) - 100) / (GetEntityMaxHealth(cache.ped) - 100) * 100)
    local armor = (GetPedArmour(cache.ped))
    local oxygen = (GetPlayerUnderwaterTimeRemaining(cache.playerId))
    local phone = LocalPlayer.state.PhoneOpen
    local voice = LocalPlayer.state.proximity.distance
    if voice then
        if voice == 1.5 then
            voice = 25
        elseif voice == 3.0 then
            voice = 50

        elseif voice == 6.0 then
            voice = 100

        else
            SetTextFont(0)
            SetTextProportional(1)
            SetTextScale(0.0, 0.3)
            SetTextColour(128, 128, 128, 255)
            SetTextDropshadow(0, 0, 0, 0, 255)
            SetTextEdge(1, 0, 0, 0, 255)
            SetTextDropShadow()
            SetTextOutline()
            SetTextEntry("STRING")
            AddTextComponentString("WŁĄCZ ROZMOWE GŁOSOWĄ W USTAWIENIACH")
            DrawText(0.005, 0.005)
        end

    end



    
    local hunger = data[2].val/1000000*100
    local thirst = data[3].val/1000000*100
    SendNUIMessage({
        type = "update",
        data = {hp,armor,hunger,thirst,oxygen,phone},
    })
    SendNUIMessage({
        type = "updatemic",
        voiceMode = voice,
    })



   

end)

lib.onCache('vehicle', function(value)

    inVeh = value and true or false

        
    SendNUIMessage({
        type = "showcarhud",
        data = inVeh,
    })


    DisplayRadar(inVeh)
    Citizen.CreateThread(function()
        while inVeh do
            local heading = 360.0 - ((GetGameplayCamRot(0).z + 360.0) % 360.0)
            local coords = GetEntityCoords(value)
            local speed = GetEntitySpeed(value)
            if(Config.metrics == "mph") then
                speed = speed * 2.236936
            else
                speed = speed * 3.6
            end
            if Config.seatbelt then
                multiplier = 15.8
            else
                multiplier = 25.8

            end
            SendNUIMessage({
                type = 'updatecarhud',
                carhud = inVeh,
                speed = math.floor(speed),
                metrics = Config.metrics,
                compass = directions[(math.floor((heading / 45) + 0.5) % 8) + 1],
                road = GetStreetNameFromHashKey(GetStreetNameAtCoord(coords.x, coords.y, coords.z)),
                fuel =  Entity(value).state.fuel,
                rpms = GetVehicleCurrentRpm(value)*multiplier,
                belticon = Config.seatbelt,
                belt = Config.seatbeltgetter(),

            })
            Citizen.Wait(100)
        end
        if inVeh == false then
            SendNUIMessage({
                type = 'updatecarhud',
                carhud = inVeh,
            })                
            SendNUIMessage({
                type = "showcarhud",
                data = inVeh,
            })
        end
    end)
end)

