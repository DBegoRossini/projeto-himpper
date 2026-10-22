from datetime import date, datetime, timedelta


def adicionar_horas_uteis(
    inicio: datetime,
    horas: float,
    feriados: set[date],
) -> datetime:
    if horas <= 0:
        return inicio + timedelta(hours=horas)

    restante = horas
    atual = inicio

    while restante > 0:
        while atual.weekday() >= 5 or atual.date() in feriados:
            atual = (atual + timedelta(days=1)).replace(
                hour=8,
                minute=0,
                second=0,
                microsecond=0,
            )

        if atual.hour < 8:
            atual = atual.replace(hour=8, minute=0, second=0, microsecond=0)
        elif atual.hour >= 18:
            atual = (atual + timedelta(days=1)).replace(
                hour=8,
                minute=0,
                second=0,
                microsecond=0,
            )
            continue

        fim_expediente = atual.replace(hour=18, minute=0, second=0, microsecond=0)
        horas_disponiveis = (fim_expediente - atual).total_seconds() / 3600
        if restante <= horas_disponiveis:
            return atual + timedelta(hours=restante)

        restante -= horas_disponiveis
        atual = (atual + timedelta(days=1)).replace(
            hour=8,
            minute=0,
            second=0,
            microsecond=0,
        )

    return atual
