<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:output method="html" indent="yes" />

	<xsl:template match="/">
        <html>
            <head>
                <link rel="stylesheet" href="../xslt/style.css"/>
            </head>
            <body>
                <div id="top-bar"><xsl:value-of select="/*/@user"/></div>
                <div id="events-container">
                    <xsl:apply-templates/>
                </div>
            </body>
        </html>
	</xsl:template>

    <xsl:template match="event">
        <div class="eventContainer">
            <div class="tags">
                <span><xsl:value-of select="type"/></span>
                <xsl:if test="date[@repeat]">
                    <span>
                        <img><xsl:attribute name="src">../xslt/images/repeat.svg</xsl:attribute></img>
                        <xsl:value-of select="date/@repeat"/>
                    </span>
                </xsl:if>
            </div>
            <div class="eventTitle">
                <h2><xsl:value-of select="title"/></h2>
                <xsl:if test="venue">
                    <img><xsl:attribute name="src">../xslt/images/venue.svg</xsl:attribute></img>
                    <span><xsl:value-of select="venue"/></span>
                </xsl:if>
            </div>
            <xsl:if test="description">
                <p class="eventDescription"><xsl:value-of select="description"/></p>
            </xsl:if>
            <xsl:if test="date/startingTime or date/endingTime">
                <div class="eventSlot">
                    <xsl:if test="date/startingTime">
                        <p class="fromTime">From: <xsl:value-of select="date/startingTime"/></p>
                    </xsl:if>
                    <xsl:if test="date/endingTime">
                        <p class="toTime">To: <xsl:value-of select="date/endingTime"/></p>
                    </xsl:if>
                </div>
            </xsl:if>
            <xsl:if test="guests">
                <div class="guestList">
                    <h3>Guests</h3>
                    <xsl:for-each select="guests/guest">
                       <span class="guest">- <xsl:value-of select="name"/><xsl:if test="name != '' and email != ''">&#160;|&#160;</xsl:if><xsl:value-of select="email"/></span>
                    </xsl:for-each>
                </div>
            </xsl:if>
            <div class="eventDate">
                <img><xsl:attribute name="src">../xslt/images/calendar.svg</xsl:attribute></img>
                <span><xsl:value-of select="date/month"/>&#160;<xsl:value-of select="date/day"/></span>
            </div>
        </div>
    </xsl:template>
</xsl:stylesheet>