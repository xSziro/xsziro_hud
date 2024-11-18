Config = {}

Config.Locale = 'en'
Config.metrics = 'kph' -- or mph
Config.seatbelt = true -- seatbelt icon
Config.seatbeltgetter = function () -- seatbelt state getter function

    return exports["esx_cruisecontrol"]:isSeatbeltOn()
end