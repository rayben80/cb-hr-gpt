/**
 * 개발/프로덕션 환경을 구분하는 로거 유틸리티
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
    private isDevelopment = import.meta.env.DEV;

    private formatMessage(level: LogLevel, message: string, ...args: any[]): void {
        if (!this.isDevelopment && level === 'debug') {
            return; // 프로덕션에서는 debug 로그 제외
        }

        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        
        switch (level) {
            case 'debug':
                console.log(prefix, message, ...args);
                break;
            case 'info':
                console.info(prefix, message, ...args);
                break;
            case 'warn':
                console.warn(prefix, message, ...args);
                break;
            case 'error':
                console.error(prefix, message, ...args);
                break;
        }
    }

    debug(message: string, ...args: any[]): void {
        this.formatMessage('debug', message, ...args);
    }

    info(message: string, ...args: any[]): void {
        this.formatMessage('info', message, ...args);
    }

    warn(message: string, ...args: any[]): void {
        this.formatMessage('warn', message, ...args);
    }

    error(message: string, ...args: any[]): void {
        this.formatMessage('error', message, ...args);
    }

    developmentMode(message: string, ...args: any[]): void {
        this.info(`🛠️ 개발 모드: ${message}`, ...args);
    }

    networkError(message: string, ...args: any[]): void {
        this.error(`🌐 네트워크 오류: ${message}`, ...args);
    }
}

export const logger = new Logger();
