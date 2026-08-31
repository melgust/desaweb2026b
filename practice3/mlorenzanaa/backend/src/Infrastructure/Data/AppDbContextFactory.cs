using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Data;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        // 1. Busca la configuración en la carpeta del proyecto API
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "src", "Api");
        
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.Exists(basePath) ? basePath : Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        // 2. Lee la cadena de conexión o usa la fallback con el puerto 3307
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Server=127.0.0.1;Port=3307;Database=EnterpriseDb;User=root;Password=YourSecurePassword123!;";

        var builder = new DbContextOptionsBuilder<AppDbContext>();
        
        // 3. Configura MySQL especificando la versión fija para evitar la autodetección
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 30));
        builder.UseMySql(connectionString, serverVersion);

        return new AppDbContext(builder.Options);
    }
}