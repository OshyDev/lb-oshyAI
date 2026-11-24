local provider = GetConvar("oshy_ai_provider", "openai"):lower()
local apiKey = GetConvar("oshy_ai_api_key", "")
local model = GetConvar("oshy_ai_model", "")

local providers = {
    openai = { url = "https://api.openai.com/v1/chat/completions", model = "gpt-4o-mini" },
    groq = { url = "https://api.groq.com/openai/v1/chat/completions", model = "llama-3.3-70b-versatile" }
}
local lastRequest = {}

RegisterNetEvent("oshy-ai:ask", function(id, prompt)
    local player = source
    if type(id) ~= "number" or type(prompt) ~= "string" or #prompt == 0 or #prompt > 2000 then return end

    local now = os.time()
    if lastRequest[player] and now - lastRequest[player] < 2 then
        TriggerClientEvent("oshy-ai:reply", player, id, { success = false, error = "Give it a moment before sending another message." })
        return
    end
    lastRequest[player] = now

    local selected = providers[provider]
    if not selected then
        TriggerClientEvent("oshy-ai:reply", player, id, { success = false, error = "The assistant isn’t configured correctly." })
        return
    end
    if apiKey == "" then
        TriggerClientEvent("oshy-ai:reply", player, id, { success = false, error = "The API key is missing. Please contact the server admin." })
        return
    end

    local payload = {
        model = model ~= "" and model or selected.model,
        messages = {
            { role = "system", content = "You are Oshy, a helpful assistant in a FiveM phone app. Reply in the language the user writes in. Keep replies natural, clear, and concise, like a real conversation. Avoid overly formal or robotic wording." },
            { role = "user", content = prompt }
        },
        temperature = 0.7,
        max_tokens = 700
    }

    PerformHttpRequest(selected.url, function(status, body)
        if status < 200 or status >= 300 then
            print(("[Oshy] API request failed (HTTP %s)"):format(status))
            TriggerClientEvent("oshy-ai:reply", player, id, { success = false, error = "Couldn’t reach the assistant. Try again in a moment." })
            return
        end

        local decoded = json.decode(body or "{}")
        local answer = decoded and decoded.choices and decoded.choices[1] and decoded.choices[1].message and decoded.choices[1].message.content
        if type(answer) ~= "string" or answer == "" then
            TriggerClientEvent("oshy-ai:reply", player, id, { success = false, error = "That reply came back empty. Please try again." })
            return
        end
        TriggerClientEvent("oshy-ai:reply", player, id, { success = true, answer = answer })
    end, "POST", json.encode(payload), {
        ["Content-Type"] = "application/json",
        ["Authorization"] = "Bearer " .. apiKey
    })
end)

AddEventHandler("playerDropped", function()
    lastRequest[source] = nil
end)
