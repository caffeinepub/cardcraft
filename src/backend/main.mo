import OutCall "http-outcalls/outcall";
import Runtime "mo:core/Runtime";

actor {
  var apiKey : Text = "";

  let openAiApiUrl = "https://api.openai.com/v1/chat/completions";

  public shared ({ caller }) func setApiKey(newApiKey : Text) : async () {
    apiKey := newApiKey;
  };

  func getApiKey() : Text {
    if (apiKey == "") {
      Runtime.trap("API key not set. Please use setApiKey first.");
    };
    apiKey;
  };

  public query ({ caller }) func transformOpenAIResponse(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func generateCard(prompt : Text) : async Text {
    let apiKey = getApiKey();

    let systemPrompt = "You are a greeting card generator. The user will describe a card. Extract their intent carefully. Return ONLY valid JSON with exactly these fields: {\"title\": \"string\", \"message\": \"string\", \"subtitle\": \"string\", \"suggestedTemplate\": \"string\", \"backgroundColor\": \"string\", \"textColor\": \"string\"}. Rules: 1) If user mentions a color (blue, red, green, yellow, pink, purple, orange, etc.) set backgroundColor to that color as a HEX code. Blue=#3B82F6, Red=#EF4444, Green=#22C55E, Yellow=#EAB308, Pink=#EC4899, Purple=#8B5CF6, Orange=#F97316, Gold=#D4AF37, White=#FFFFFF, Black=#1E1E2E. 2) suggestedTemplate must match the card type: birthday, wedding, diwali, christmas, eid, holi, anniversary, graduation, thanksgiving, navratri, lohri, pongal. 3) textColor should contrast with backgroundColor (use #FFFFFF for dark backgrounds, #1E1E2E for light backgrounds). 4) NEVER return anything other than the JSON object. No explanations.";

    let requestBody = "{
      \"model\": \"gpt-3.5-turbo\",
      \"messages\": [
        {\"role\": \"system\", \"content\": \"" # systemPrompt # "\"},
        {\"role\": \"user\", \"content\": \"" # prompt # "\"}
      ],
      \"max_tokens\": 400
    }";

    let headers : [OutCall.Header] = [
      { name = "Authorization"; value = "Bearer " # apiKey },
      { name = "Content-Type"; value = "application/json" },
    ];

    await OutCall.httpPostRequest(openAiApiUrl, headers, requestBody, transformOpenAIResponse);
  };
};
