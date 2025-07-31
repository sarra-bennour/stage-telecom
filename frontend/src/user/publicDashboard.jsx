import { PowerBIEmbed } from 'powerbi-client-react';
import {models} from 'powerbi-client'
import "./publicDashboard.css"


export default function PublicDashboard() {

    return (
        <div className="dashboard-container">
            <PowerBIEmbed
                embedConfig={{
                    type: 'report',   // Supported types: report, dashboard, tile, visual, qna, paginated report and create
                    id: '6c4553c3-386c-43a1-a2ef-2fce9b8ba3f4',
                    embedUrl: "https://app.powerbi.com/reportEmbed?reportId=6c4553c3-386c-43a1-a2ef-2fce9b8ba3f4&groupId=036edc8e-1c58-4ff5-99f1-c2cb7d02cd98&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLU5PUlRILUVVUk9QRS1JLVBSSU1BUlktcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQiLCJlbWJlZEZlYXR1cmVzIjp7InVzYWdlTWV0cmljc1ZOZXh0Ijp0cnVlfX0%3d",
                    accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkpZaEFjVFBNWl9MWDZEQmxPV1E3SG4wTmVYRSIsImtpZCI6IkpZaEFjVFBNWl9MWDZEQmxPV1E3SG4wTmVYRSJ9.eyJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvNjA0ZjFhOTYtY2JlOC00M2Y4LWFiYmYtZjhlYWY1ZDg1NzMwLyIsImlhdCI6MTc1Mzk1ODI1NSwibmJmIjoxNzUzOTU4MjU1LCJleHAiOjE3NTM5NjM1NjEsImFjY3QiOjAsImFjciI6IjEiLCJhaW8iOiJBWFFBaS84WkFBQUFVY0hUY1ZsU2dzRjNOYk15THozNHA4b2FXemRWa2psRWlOQnVCSmVFLzg0VDJ0R2tUekdsQ2l4NjVOTTVIVWd6dFpWbnUramlvSGdLWUxSRE55OXVPUk4zcUo4V2tUeVJmZys4WEsxNkRqTW5Tc2FpTCtUSEpsT0lwT2UySEUveDFaaDdpV2N6ZHRBcHFEZDk2bkZqK2c9PSIsImFtciI6WyJwd2QiLCJtZmEiXSwiYXBwaWQiOiI4NzFjMDEwZi01ZTYxLTRmYjEtODNhYy05ODYxMGE3ZTkxMTAiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IkJFTk5PVVIiLCJnaXZlbl9uYW1lIjoiU2FycmEiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIyYzBmOjQyODA6MzA6MzA1Yjo3OTI1OmY5ZjU6NGQxOmM4MzYiLCJuYW1lIjoiU2FycmEgQkVOTk9VUiIsIm9pZCI6IjRjN2IzM2IxLWVmYmMtNDI2ZC1iNmEwLWE3ZDZiNWFkY2M1OCIsInB1aWQiOiIxMDAzMjAwMzA5QjFGODdCIiwicmgiOiIxLkFUb0FsaHBQWU9qTC1FT3J2X2pxOWRoWE1Ba0FBQUFBQUFBQXdBQUFBQUFBQUFBNkFKVTZBQS4iLCJzY3AiOiJ1c2VyX2ltcGVyc29uYXRpb24iLCJzaWQiOiI5N2JlNWUyYi0yZjMyLTRhYmQtYTQxZS0wNmE3MDFjNmM3NTUiLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJfTDdKREw3UnZEa28xYlZwRU9KY0hxVnk1a2lOUXR1V3hEdFlKc0pjbkRNIiwidGlkIjoiNjA0ZjFhOTYtY2JlOC00M2Y4LWFiYmYtZjhlYWY1ZDg1NzMwIiwidW5pcXVlX25hbWUiOiJzYXJyYS5iZW5ub3VyQGVzcHJpdC50biIsInVwbiI6InNhcnJhLmJlbm5vdXJAZXNwcml0LnRuIiwidXRpIjoiVHNueTF0dm5oRTJ5Z3hJWVl1NWlBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiYjc5ZmJmNGQtM2VmOS00Njg5LTgxNDMtNzZiMTk0ZTg1NTA5Il0sInhtc19mdGQiOiIxWUtuOWtNSmI5RF9fRFFYcWoxVlNXS25sTU95dm5hTlNJWXNBRFlkRkNzQlpYVnliM0JsYm05eWRHZ3RaSE50Y3ciLCJ4bXNfaWRyZWwiOiIxIDMyIn0.n6qoYgkL5ebVq4-ay9QwxhTm8V61km5BhzxLYOsqVRpqs3YJ5pqYBLSwgTDsiLhY67kZ0QAYrmR9S8JHLSEt65S68Nzv7zVXAl_MsjjwnRbZocZhfc9gicXVNteonrXqPYo3WAAE3XoBi2_BspGd0hCKEgvMKOoOz31hDZPvuy4rdNDRH-gdM8Cb8CzhXR85joz4JX6nbc0xoBYPESuCpJm8M01vfpJyEVAFwIplgJ1pl3qrezL0DB6uLR-e2uUcNIPNiXNq4GwMLpCIn57UNIub7nAV-JcvbVoOVDqYtsyVOse9faYClWHWNoMqGYIiq6KJbpVJXSzarIDBo_ZmjQ',
                    tokenType: models.TokenType.Aad, // Use models.TokenType.Aad for SaaS embed
                    settings: {
                        panes: {
                            filters: {
                                expanded: false,
                                visible: false
                            }
                        },
                        background: models.BackgroundType.Transparent,
                    }
                }}

                eventHandlers={
                    new Map([
                        ['loaded', function () { console.log('Report loaded'); }],
                        ['rendered', function () { console.log('Report rendered'); }],
                        ['error', function (event) { console.log(event.detail); }],
                        ['visualClicked', () => console.log('visual clicked')],
                        ['pageChanged', (event) => console.log(event)],
                    ])
                }

                cssClassName={"Embed-container"}

                getEmbeddedComponent={(embeddedReport) => {
                    window.report = embeddedReport;
                }}
            />
        </div>
    );
}