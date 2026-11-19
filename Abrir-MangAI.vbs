Option Explicit

Dim fso, shell, scriptDir, cmd
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

If Not fso.FolderExists(scriptDir & "\node_modules") Then
    cmd = "cmd.exe /c cd /d " & Chr(34) & scriptDir & Chr(34) & " && npm ci && npx tauri dev"
Else
    cmd = "cmd.exe /c cd /d " & Chr(34) & scriptDir & Chr(34) & " && npx tauri dev"
End If

shell.Run cmd, 0, False

Set shell = Nothing
Set fso = Nothing
