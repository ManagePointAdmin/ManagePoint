$Path1 = "d:\Work\MAP Final\ManagePoint\src\pages\RegisterPage.jsx"
$Path2 = "d:\Work\MAP Final\ManagePoint\src\pages\LoginPage.jsx"

$HandleChange_JS = @'
    const handleChange = (field, value) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        if (touched[field]) setFieldErrors(validate(updated));

        if (field === "email") {
            const atIndex = value.indexOf("@");
            if (atIndex !== -1 && !value.slice(atIndex).includes(".")) {
                const afterAt = value.slice(atIndex + 1);
                const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
                setEmailSuggestions(domains.filter(d => d.startsWith(afterAt)));
            } else {
                setEmailSuggestions([]);
            }
        }
    };
'@

$SuggestionsInput_JS = @'
                            <div className="relative">
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    onBlur={() => { handleBlur("email"); setTimeout(() => setEmailSuggestions([]), 200); }}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    className={`${inputClass("email")} relative z-10`}
                                />
                                {emailSuggestions.length > 0 && (
                                    <ul className="absolute z-20 w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl mt-1 shadow-lg py-1 max-h-40 overflow-y-auto">
                                        {emailSuggestions.map((dom) => (
                                            <li 
                                                key={dom} 
                                                onClick={() => {
                                                    const atIndex = formData.email.indexOf('@');
                                                    const base = formData.email.slice(0, atIndex + 1);
                                                    setFormData({ ...formData, email: base + dom });
                                                    setEmailSuggestions([]);
                                                }}
                                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer text-sm text-gray-700 dark:text-zinc-300 transition-colors"
                                            >
                                                {formData.email.slice(0, formData.email.indexOf('@') + 1)}{dom}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
'@

# 1. Update RegisterPage.jsx
if (Test-Path $Path1) {
    $Content1 = Get-Content -Path $Path1 -Raw
    
    # Replace handleChange
    # We replace from const handleChange... to setFieldErrors(validate(updated));\s*}
    $Content1 = $Content1 -replace '(?s)const handleChange = \(field, value\) => {.*?setFieldErrors\(validate\(updated\)\);\s*}', $HandleChange_JS

    # Wrap input
    $Content1 = $Content1 -replace '(?s)<input\s+type="email".*?className={inputClass\("email"\)}\s*/>', $SuggestionsInput_JS

    Set-Content -Path $Path1 -Value $Content1 -NoNewline
}

# 2. Update LoginPage.jsx
if (Test-Path $Path2) {
    $Content2 = Get-Content -Path $Path2 -Raw
    
    # State state
    $Content2 = $Content2 -replace 'const \[touched, setTouched\] = useState\(\{\}\);', 'const [touched, setTouched] = useState({});`n    const [emailSuggestions, setEmailSuggestions] = useState([]);'

    @'
    const handleChange = (field, value) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        
        if (touched[field]) {
            setFieldErrors(validate(updated));
        }

        if (field === "email") { ... }
    };
    '@
    $Content2 = $Content2 -replace '(?s)const handleChange = \(field, value\) => {.*?setFieldErrors\(validate\(formData\)\);\s*}', $HandleChange_JS
    # Wait, LoginPage might use setFieldErrors(validate(formData)) instead of validate(updated)!
    # Let's verify line 48 in LoginPage.jsx from my previous view_file!
    # "if (touched[field]) { setFieldErrors(validate(updated)); }" It uses updated!
    $Content2 = $Content2 -replace '(?s)const handleChange = \(field, value\) => {.*?setFieldErrors\(validate\(updated\)\);\s*}', $HandleChange_JS

    # Wrap input
    $Content2 = $Content2 -replace '(?s)<input\s+type="email".*?className={inputClass\("email"\)}\s*/>', $SuggestionsInput_JS

    Set-Content -Path $Path2 -Value $Content2 -NoNewline
}

Write-Output "Email Suggestions Appended Safely"
