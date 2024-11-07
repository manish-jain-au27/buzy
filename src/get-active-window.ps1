# Define the User32 class with the necessary methods
Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;

public class User32 {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

    [DllImport("user32.dll")]
    public static extern int GetWindowTextLength(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern int GetWindowThreadProcessId(IntPtr hWnd, out int processId);
}
"@

# Get the handle of the active window
$hWnd = [User32]::GetForegroundWindow()

# Get the length of the window title
$len = [User32]::GetWindowTextLength($hWnd) + 1

# Initialize a StringBuilder to hold the window title
$sb = New-Object Text.StringBuilder $len

# Get the window title
[User32]::GetWindowText($hWnd, $sb, $len)
$title = $sb.ToString()

# Define a variable for the process ID
$processId = 0

# Get the process ID of the active window
$null = [User32]::GetWindowThreadProcessId($hWnd, [ref]$processId)

# Get the process details
$process = Get-Process -Id $processId
$app = $process.ProcessName

# Output the app and title in a key-value format
Write-Output "app=$app"
Write-Output "title=$title"