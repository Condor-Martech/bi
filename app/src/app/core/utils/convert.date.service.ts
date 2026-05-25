import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConvertDate {

    public toTimestamp = (dateString: string): number => {
        const date = DateTime.fromISO(dateString);
        const timestamp = Math.floor(date.toSeconds());
        return timestamp;
    }
    public currentDate = (): number => {
        const data = DateTime.now().plus({ minutes: 10 }).toUTC(-3).toFormat('x');
        return Number(data);
    }
    public toDate = (date: string): string => {
        const newDate = DateTime.fromMillis(Number(date)).setLocale('pt-br').toLocaleString()
        return newDate;
    };

}