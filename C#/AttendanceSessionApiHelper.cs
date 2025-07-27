using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class AttendanceSession
{
    public int id { get; set; }
    public string session_name { get; set; }
    public string time_in { get; set; }
    public string time_out { get; set; }
    public string late_time { get; set; }
}

public static class AttendanceSessionApiHelper
{
    private static List<AttendanceSession> _cachedSessions = null;
    private static DateTime _lastCacheUpdate = DateTime.MinValue;
    private static readonly TimeSpan _cacheExpiry = TimeSpan.FromMinutes(5); // Cache for 5 minutes

    public static async Task<List<AttendanceSession>> FetchSessionTimesAsync(string apiBaseUrl)
    {
        using (var client = new HttpClient())
        {
            var response = await client.GetAsync($"{apiBaseUrl}/api/attendance-sessions");
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<AttendanceSession>>(json);
        }
    }

    public static async Task<List<AttendanceSession>> GetCachedSessionsAsync(string apiBaseUrl)
    {
        // Check if cache is valid
        if (_cachedSessions != null && DateTime.Now - _lastCacheUpdate < _cacheExpiry)
        {
            return _cachedSessions;
        }

        // Fetch fresh data
        _cachedSessions = await FetchSessionTimesAsync(apiBaseUrl);
        _lastCacheUpdate = DateTime.Now;
        return _cachedSessions;
    }

    public static async Task<string> DetermineSessionAsync(DateTime timeIn, string apiBaseUrl)
    {
        try
        {
            var sessions = await GetCachedSessionsAsync(apiBaseUrl);

            foreach (var session in sessions)
            {
                if (TimeSpan.TryParse(session.time_in, out TimeSpan sessionStart) &&
                    TimeSpan.TryParse(session.time_out, out TimeSpan sessionEnd))
                {
                    TimeSpan currentTime = timeIn.TimeOfDay;

                    // Handle sessions that span midnight
                    if (sessionStart > sessionEnd)
                    {
                        // Session spans midnight (e.g., night shift)
                        if (currentTime >= sessionStart || currentTime < sessionEnd)
                        {
                            return session.session_name;
                        }
                    }
                    else
                    {
                        // Normal session within same day
                        if (currentTime >= sessionStart && currentTime < sessionEnd)
                        {
                            return session.session_name;
                        }
                    }
                }
            }

            // Fallback to default logic if no API data
            return DetermineSessionFallback(timeIn);
        }
        catch (Exception ex)
        {
            // Log error and fallback to default logic
            Console.WriteLine($"Error determining session from API: {ex.Message}");
            return DetermineSessionFallback(timeIn);
        }
    }

    private static string DetermineSessionFallback(DateTime timeIn)
    {
        // Your original fallback logic
        int hour = timeIn.Hour;
        if (hour >= 6 && hour < 12)
            return "morning";
        else if (hour >= 12 && hour < 18)
            return "afternoon";
        else
            return "night";
    }

    public static async Task<bool> IsLateAsync(DateTime timeIn, string sessionName, string apiBaseUrl)
    {
        try
        {
            var sessions = await GetCachedSessionsAsync(apiBaseUrl);
            var session = sessions.Find(s => s.session_name.Equals(sessionName, StringComparison.OrdinalIgnoreCase));

            if (session != null && !string.IsNullOrEmpty(session.late_time))
            {
                if (TimeSpan.TryParse(session.time_in, out TimeSpan sessionStart) &&
                    TimeSpan.TryParse(session.late_time, out TimeSpan lateTime))
                {
                    TimeSpan currentTime = timeIn.TimeOfDay;
                    TimeSpan lateThreshold = sessionStart.Add(lateTime);

                    return currentTime > lateThreshold;
                }
            }

            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error checking late status: {ex.Message}");
            return false;
        }
    }

    public static async Task<string> GetSessionStatusAsync(DateTime timeIn, string apiBaseUrl)
    {
        var sessionName = await DetermineSessionAsync(timeIn, apiBaseUrl);
        var isLate = await IsLateAsync(timeIn, sessionName, apiBaseUrl);

        if (isLate)
            return "Late";
        else
            return "On Time";
    }

    public static async Task<bool> IsAttendanceAllowedAsync(DateTime currentTime, string apiBaseUrl)
    {
        try
        {
            var sessions = await GetCachedSessionsAsync(apiBaseUrl);
            TimeSpan currentTimeSpan = currentTime.TimeOfDay;

            foreach (var session in sessions)
            {
                if (TimeSpan.TryParse(session.time_in, out TimeSpan sessionStart) &&
                    TimeSpan.TryParse(session.time_out, out TimeSpan sessionEnd))
                {
                    // Handle sessions that span midnight (e.g., night shift)
                    if (sessionStart > sessionEnd)
                    {
                        // Session spans midnight (e.g., 22:00 to 06:00)
                        if (currentTimeSpan >= sessionStart || currentTimeSpan < sessionEnd)
                        {
                            return true; // Attendance allowed during this session
                        }
                    }
                    else
                    {
                        // Normal session within same day
                        if (currentTimeSpan >= sessionStart && currentTimeSpan < sessionEnd)
                        {
                            return true; // Attendance allowed during this session
                        }
                    }
                }
            }

            return false; // No active session found
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error checking attendance allowance: {ex.Message}");
            return true; // Allow attendance if API fails (fallback)
        }
    }

    public static async Task<string> GetCurrentSessionNameAsync(DateTime currentTime, string apiBaseUrl)
    {
        try
        {
            var sessions = await GetCachedSessionsAsync(apiBaseUrl);
            TimeSpan currentTimeSpan = currentTime.TimeOfDay;

            foreach (var session in sessions)
            {
                if (TimeSpan.TryParse(session.time_in, out TimeSpan sessionStart) &&
                    TimeSpan.TryParse(session.time_out, out TimeSpan sessionEnd))
                {
                    // Handle sessions that span midnight
                    if (sessionStart > sessionEnd)
                    {
                        if (currentTimeSpan >= sessionStart || currentTimeSpan < sessionEnd)
                        {
                            return session.session_name;
                        }
                    }
                    else
                    {
                        if (currentTimeSpan >= sessionStart && currentTimeSpan < sessionEnd)
                        {
                            return session.session_name;
                        }
                    }
                }
            }

            return "No Active Session";
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting current session: {ex.Message}");
            return "Unknown";
        }
    }
}
